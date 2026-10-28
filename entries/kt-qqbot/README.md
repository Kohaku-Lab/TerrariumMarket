# kt-qqbot

Puts a KohakuTerrarium creature into QQ private chats and QQ group chats.

The creature hears QQ through the `qq_feed` trigger and speaks only through the
`qq_send` tool. Text it writes freely never reaches QQ, so staying silent is the
default and the creature decides when a message is worth sending, like a group
member does.

## Install

Requires a KohakuTerrarium release newer than 2.1.8 (a nightly works).

```bash
kt install @kt-qqbot
kt-qqbot login            # QR code; scan it with mobile QQ
kt-qqbot login --manual   # or enter an existing bot's AppID and AppSecret
```

You can also bind the bot from the dashboard: Settings → QQ Bot.

## Run

```bash
kt run @kt-qqbot/creatures/qq-group-chat   # one creature for every chat
kt run @kt-qqbot/creatures/qq-router       # one creature per chat
```

Both also start from `kt serve`.

## What it gives a creature

- `qq_feed`: new chat arrives as incremental, chat-log style updates. Wake modes
  are `mention`, `all` and `ambient` (the default, which waits for a pause).
- `qq_send`: text, @-mentions, quotes and media. Media is chosen by handle:
  chat attachments (`m12.1`), stickers (`sticker:<name>`), image search results
  (`img:<n>`) or the persona image (`persona`).
- `qq_history`, `qq_sticker`, `qq_image_search` (Brave with `BRAVE_API_KEY`,
  else DuckDuckGo), plus core `web_search` and `web_fetch` in the example
  creature.

## Character

The example creature has no character. Put `character.md` (and optionally a
`character.png` persona image) in `~/.kohakuterrarium/qq-bot/`. The text is added
to the system prompt; the image is pinned right after it, so it survives
compaction.

## Safety

- `qq_guard` hides graph and Drive tools from a dashboard-started (privileged)
  creature, because QQ users can steer it.
- `qq_web_guard` refuses `web_fetch` to private addresses.
- Chat text is escaped so a QQ message cannot fake feed lines or operator input.
- Under multi-user mode only admin creatures may use the bot.

## Limits

QQ bots can only reply shortly after someone speaks: 5 replies per message
within 5 minutes in groups, 4 within 60 minutes in private chats. Active
messages were shut down by QQ on 2025-04-21. Receiving non-@ group messages
needs the group owner to turn on 获取群内全部消息.

Full documentation: the [repository README](https://github.com/Kohaku-Lab/kt-qqbot).
