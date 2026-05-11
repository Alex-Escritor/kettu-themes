import { findByName, findByProps } from "@vendetta/metro";
import { React, ReactNative, i18n } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

const patches = [];

const View = ReactNative.View;

const WebhookOverview = findByName("ConnectedWebhooksOverview");
const ButtonModule = findByProps("ButtonColors", "ButtonSizes");
const Button = ButtonModule?.default ?? ButtonModule;

const WebhookActions = findByProps(
    "create",
    "fetchForChannel"
);

const ChannelStore = findByProps("getChannel");

const styles = ReactNative.StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 32
    },

    button: {
        margin: 16
    }
});

function onLoad() {
    console.log("[CreateWebhooks] Loaded");

    if (!WebhookOverview) {
        console.log("[CreateWebhooks] Overview not found");
        return;
    }

    patches.push(
        after("default", WebhookOverview, (args, res) => {
            try {
                const channelId = args?.[0]?.channelId;
                const channel = ChannelStore?.getChannel?.(channelId);

                if (!channel) return res;

                return React.createElement(
                    View,
                    {
                        style: styles.container
                    },

                    res,

                    React.createElement(Button, {
                        text:
                            i18n?.Messages?.WEBHOOK_CREATE ||
                            "Create Webhook",

                        style: styles.button,

                        color: "brand",

                        onPress: () => {
                            try {
                                WebhookActions?.create?.(
                                    channel.guild_id,
                                    channel.id,
                                    "Webhook"
                                );

                                WebhookActions?.fetchForChannel?.(
                                    channel.id
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    })
                );
            } catch (e) {
                console.error("[CreateWebhooks]", e);
                return res;
            }
        })
    );
}

export default {
    onLoad,

    onUnload() {
        patches.forEach((p) => p?.());
    }
};
