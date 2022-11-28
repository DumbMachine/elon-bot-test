import {
  App,
  ExpressReceiver,
  ReceiverEvent,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
const { FileInstallationStore } = require("@slack/oauth");
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

const workspaceInstallHtml = `<a href='https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${botSopes}&redirect_uri=${oauthRedirect}' style='align-items:center;color:#fff;background-color:#4A154B;border:0;border-radius:4px;display:inline-flex;font-family:Lato,sans-serif;font-size:40px;font-weight:600;height:112px;justify-content:center;text-decoration:none;width:552px'><svg xmlns='http://www.w3.org/2000/svg' style='height:48px;width:48px;margin-right:12px' viewBox='0 0 122.8 122.8'><path d='M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z' fill='#e01e5a'></path><path d='M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z' fill='#36c5f0'></path><path d='M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z' fill='#2eb67d'></path><path d='M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z' fill='#ecb22e'></path></svg>Add to Slack</a><h1>Standard install. Go to /slack/install/orgadmin to install the app with extra admin capabilities.</h1>`;

const userScopesInstallHtml = `<a href='https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=&user_scope=${userScopes}&redirect_uri=${oauthRedirect}' style='align-items:center;color:#fff;background-color:#4A154B;border:0;border-radius:4px;display:inline-flex;font-family:Lato,sans-serif;font-size:40px;font-weight:600;height:112px;justify-content:center;text-decoration:none;width:552px'><svg xmlns='http://www.w3.org/2000/svg' style='height:48px;width:48px;margin-right:12px' viewBox='0 0 122.8 122.8'><path d='M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z' fill='#e01e5a'></path><path d='M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z' fill='#36c5f0'></path><path d='M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z' fill='#2eb67d'></path><path d='M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z' fill='#ecb22e'></path></svg>Add to Slack</a><h1>Admin install! Make sure you install this on an Organization.</h1>`;

const customRoutes = [
  {
    path: "/slack/install/workspace",
    method: ["GET"],
    handler: (req: any, res: any) => {
      res.writeHead(200);
      res.end(workspaceInstallHtml);
    },
  },
  {
    path: "/slack/install/orgadmin",
    method: ["GET"],
    handler: (req: any, res: any) => {
      res.writeHead(200);
      res.end(userScopesInstallHtml);
    },
  },
];

const app: App = new App({
  // signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  // token: `${process.env.SLACK_BOT_TOKEN}`,
  // receiver: expressReceiver,

  // thing
  // logLevel: LogLevel.DEBUG,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  // stateSecret: "horea-is-a-human",
  customRoutes: customRoutes,
  installerOptions: {
    stateVerification: false,
  },
  installationStore: new FileInstallationStore(),
});

app.get("/auth", (req, res) => {});
app.get("/auth/redirect", (req, res) => {});

app.message(async ({ message }) => {
  const text = (message as any)?.text;
  console.log("sniff messagE:", { message, text });
  let messagePacket: ISlackReply;
  if (text) {
    // trigger words
    const regex =
      /\b(?:elon|musk|twitter|engineering|code|github|interview|work|java|python|golang|js|react|intern|programming|hacker|hackernews|docker)\b/gm;

    // if (text.match(regex)) {

    if (Math.random() < 0.1) {
      // 10% change for it to talk
      messagePacket = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: message.channel,
        threadTimestamp: message.ts,
        message: muskSpeak(text),
      };
      await replyMessage(messagePacket);
    }
    // }

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
