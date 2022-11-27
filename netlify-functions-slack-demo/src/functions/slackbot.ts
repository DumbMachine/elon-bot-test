import {
  App,
  ExpressReceiver,
  ReceiverEvent,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { APIGatewayEvent, Context } from "aws-lambda";
import * as dotenv from "dotenv";
import {
  IHandlerResponse,
  ISlackPrivateReply,
  ISlackReactionReply,
  ISlackReply,
  SlashCommands,
} from "../constants";
import {
  generateReceiverEvent,
  isUrlVerificationRequest,
  muskSpeak,
  parseRequestBody,
  replyMessage,
  replyPrivateMessage,
  replyReaction,
} from "../utils";

dotenv.config();

const expressReceiver: ExpressReceiver = new ExpressReceiver({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  processBeforeResponse: true,
});

const app: App = new App({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  token: `${process.env.SLACK_BOT_TOKEN}`,
  receiver: expressReceiver,
});

// interface CustomMessage extends SlackEventMiddlewareArgs<"message"> {
//   text: string;
// }

app.message(async ({ message }) => {
  const text = (message as any)?.text;
  console.log("sniff messagE:", { message, text });
  let messagePacket: ISlackReply;
  if (text) {
    const regex = /\b(?:elon|musk)\b/gm;

    if (text.match(regex)) {
      messagePacket = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: message.channel,
        threadTimestamp: message.ts,
        message: muskSpeak(),
      };
      await replyMessage(messagePacket);
    }
    // else {
    //   messagePacket = {
    //     app: app,
    //     botToken: process.env.SLACK_BOT_TOKEN,
    //     channelId: message.channel,
    //     threadTimestamp: message.ts,
    //     message: "Hello :wave:",
    //   };
  }
  // const reactionPacket: ISlackReactionReply = {
  //   app: app,
  //   botToken: process.env.SLACK_BOT_TOKEN,
  //   channelId: message.channel,
  //   threadTimestamp: message.ts,
  //   reaction: "robot_face",
  // };
  // await replyReaction(reactionPacket);
});

app.command(SlashCommands.GREET, async ({ body, ack }) => {
  ack();

  const messagePacket: ISlackPrivateReply = {
    app: app,
    botToken: process.env.SLACK_BOT_TOKEN,
    channelId: body.channel_id,
    userId: body.user_id,
    message: "Greetings, user!",
  };
  await replyPrivateMessage(messagePacket);
});

export async function handler(
  event: APIGatewayEvent,
  context: Context
): Promise<IHandlerResponse> {
  const payload: any = parseRequestBody(
    event.body,
    event.headers["content-type"]
  );
  const everything = payload.elements
    ?.map((elem: any) => {
      return elem.elements
        ?.map((e: { text: string }) => {
          return e.text;
        })
        .join(" ");
    })
    .join(" ");

  console.log("all strings: ", everything);

  if (isUrlVerificationRequest(payload)) {
    return {
      statusCode: 200,
      body: payload?.challenge,
    };
  }

  const slackEvent: ReceiverEvent = generateReceiverEvent(payload);
  await app.processEvent(slackEvent);

  return {
    statusCode: 200,
    body: "",
  };
}

const thing = {
  token: "skfXtOPXC0CEu7N2JCdwMC7u",
  team_id: "T03FGUQ58TT",
  api_app_id: "A04CLHX1XPC",
  event: {
    client_msg_id: "5911707e-51f1-498b-9ce0-fa4591351f04",
    type: "message",
    text: "hard thing :ab:  elon musk",
    user: "U03FU2WK048",
    ts: "1669535097.037849",
    blocks: [
      {
        type: "rich_text",
        block_id: "3\\/ho9",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "hard thing " },
              { type: "emoji", name: "ab", unicode: "1f18e" },
              { type: "text", text: "  elon musk" },
            ],
          },
        ],
      },
    ],
    team: "T03FGUQ58TT",
    channel: "C03F6LQD39A",
    event_ts: "1669535097.037849",
    channel_type: "channel",
  },
  type: "event_callback",
  event_id: "Ev04C62XV7E3",
  event_time: 1669535097,
  authorizations: [
    {
      enterprise_id: null,
      team_id: "T03FGUQ58TT",
      user_id: "U04CHKM4745",
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDNGR1VRNThUVCIsImFpZCI6IkEwNENMSFgxWFBDIiwiY2lkIjoiQzAzRjZMUUQzOUEifQ",
};
thing.event.blocks.map((block) => {
  return block.elements
    .map((elem) => {
      return elem.elements
        .map((e) => {
          return e.text;
        })
        .join(" ");
    })
    .join(" ");
});
