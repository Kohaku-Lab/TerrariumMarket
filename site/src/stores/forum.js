import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { graphql } from "@octokit/graphql"

import { REGISTRY_OWNER, REGISTRY_REPO } from "@/config"
import { useAuthStore } from "@/stores/auth"

/**
 * GitHub Discussions-backed forum.
 *
 * All reads are unauthenticated (works without sign-in, subject to
 * the 60 req/hr per-IP rate limit); posts + reactions need a token
 * with public_repo scope from the auth store.
 */

const DEFAULT_PAGE_SIZE = 20

function gqlClient(token) {
  return graphql.defaults({
    headers: token ? { authorization: `bearer ${token}` } : {},
  })
}

const REPOSITORY_FIELDS_QUERY = /* GraphQL */ `
  query RepoFields($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      id
      discussionCategories(first: 25) {
        nodes {
          id
          name
          slug
          emoji
          description
          isAnswerable
        }
      }
    }
  }
`

const DISCUSSIONS_QUERY = /* GraphQL */ `
  query Discussions(
    $owner: String!
    $repo: String!
    $first: Int!
    $after: String
    $categoryId: ID
  ) {
    repository(owner: $owner, name: $repo) {
      discussions(
        first: $first
        after: $after
        categoryId: $categoryId
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
        nodes {
          id
          number
          title
          createdAt
          updatedAt
          upvoteCount
          comments {
            totalCount
          }
          category {
            name
            emoji
          }
          author {
            login
            avatarUrl
          }
        }
      }
    }
  }
`

const SINGLE_DISCUSSION_QUERY = /* GraphQL */ `
  query Discussion($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      discussion(number: $number) {
        id
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        upvoteCount
        viewerCanUpdate
        category {
          name
          emoji
          isAnswerable
        }
        author {
          login
          avatarUrl
          url
        }
        answer {
          id
        }
        comments(first: 50) {
          totalCount
          nodes {
            id
            body
            bodyHTML
            createdAt
            isAnswer
            upvoteCount
            author {
              login
              avatarUrl
              url
            }
            replies(first: 25) {
              nodes {
                id
                body
                bodyHTML
                createdAt
                upvoteCount
                author {
                  login
                  avatarUrl
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`

const ADD_DISCUSSION_MUTATION = /* GraphQL */ `
  mutation AddDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(
      input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }
    ) {
      discussion {
        number
      }
    }
  }
`

const ADD_COMMENT_MUTATION = /* GraphQL */ `
  mutation AddComment($discussionId: ID!, $body: String!, $replyToId: ID) {
    addDiscussionComment(
      input: { discussionId: $discussionId, body: $body, replyToId: $replyToId }
    ) {
      comment {
        id
      }
    }
  }
`

export const useForumStore = defineStore("forum", () => {
  const repoId = ref("")
  const categories = ref([])
  const threads = ref([])
  const totalCount = ref(0)
  const pageInfo = ref({ hasNextPage: false, endCursor: null })
  const loadingList = ref(false)
  const errorList = ref(null)

  const currentThread = ref(null)
  const loadingThread = ref(false)
  const errorThread = ref(null)

  const posting = ref(false)
  const postError = ref(null)

  function _client() {
    const auth = useAuthStore()
    return gqlClient(auth.token || null)
  }

  async function loadCategories() {
    if (categories.value.length > 0) return
    try {
      const data = await _client()(REPOSITORY_FIELDS_QUERY, {
        owner: REGISTRY_OWNER,
        repo: REGISTRY_REPO,
      })
      repoId.value = data.repository.id
      categories.value = data.repository.discussionCategories.nodes
    } catch (err) {
      errorList.value = err
    }
  }

  async function loadThreads({ categoryId = null, reset = true } = {}) {
    if (loadingList.value) return
    loadingList.value = true
    errorList.value = null
    if (reset) {
      threads.value = []
      pageInfo.value = { hasNextPage: false, endCursor: null }
    }
    try {
      await loadCategories()
      const data = await _client()(DISCUSSIONS_QUERY, {
        owner: REGISTRY_OWNER,
        repo: REGISTRY_REPO,
        first: DEFAULT_PAGE_SIZE,
        after: reset ? null : pageInfo.value.endCursor,
        categoryId,
      })
      const discussions = data.repository.discussions
      threads.value = reset ? discussions.nodes : [...threads.value, ...discussions.nodes]
      totalCount.value = discussions.totalCount
      pageInfo.value = discussions.pageInfo
    } catch (err) {
      errorList.value = err
    } finally {
      loadingList.value = false
    }
  }

  async function loadThread(number) {
    loadingThread.value = true
    errorThread.value = null
    currentThread.value = null
    try {
      const data = await _client()(SINGLE_DISCUSSION_QUERY, {
        owner: REGISTRY_OWNER,
        repo: REGISTRY_REPO,
        number,
      })
      currentThread.value = data.repository.discussion
    } catch (err) {
      errorThread.value = err
    } finally {
      loadingThread.value = false
    }
  }

  async function postNewThread({ categoryId, title, body }) {
    posting.value = true
    postError.value = null
    try {
      await loadCategories()
      const data = await _client()(ADD_DISCUSSION_MUTATION, {
        repositoryId: repoId.value,
        categoryId,
        title,
        body,
      })
      return data.createDiscussion.discussion.number
    } catch (err) {
      postError.value = err
      throw err
    } finally {
      posting.value = false
    }
  }

  async function postReply({ discussionId, body, replyToId = null }) {
    posting.value = true
    postError.value = null
    try {
      await _client()(ADD_COMMENT_MUTATION, {
        discussionId,
        body,
        replyToId,
      })
    } catch (err) {
      postError.value = err
      throw err
    } finally {
      posting.value = false
    }
  }

  const activeCategories = computed(() => categories.value)

  return {
    repoId,
    categories,
    activeCategories,
    threads,
    totalCount,
    pageInfo,
    loadingList,
    errorList,
    currentThread,
    loadingThread,
    errorThread,
    posting,
    postError,
    loadCategories,
    loadThreads,
    loadThread,
    postNewThread,
    postReply,
  }
})
