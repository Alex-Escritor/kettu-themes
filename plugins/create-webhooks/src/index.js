const { findByName, findByProps } = require("@vendetta/metro");
const {
    React,
    ReactNative,
    i18n
} = require("@vendetta/metro/common");

const { after } = require("@vendetta/patcher");

const patches = [];

const { View } = ReactNative;

const WebhookOverview = findByName(
    "ConnectedWebhooksOverview",
    false
);

const ButtonModule = findByProps(
    "ButtonColors",
    "ButtonSizes"
);

const Button = ButtonModule?.default ?? ButtonModule;

const WebhookActions = findByProps(
    "create",
    "fetchForChannel"
);

const ChannelStore = findByProps("getChannel");

const styles = ReactNative.StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 24
    },

    button: {
        margin: 16
    }
});

function onLoad() {
    console.log("[CreateWebhooks] loading");

    console.log("Overview:", WebhookOverview);

    if (!WebhookOverview) {
        console.log("[CreateWebhooks] overview not found");
        return;
    }

    patches.push(
        after("default", WebhookOverview, (args, res) => {
            try {
                const channelId = args?.[0]?.channelId;

                const channel =
                    ChannelStore?.getChannel?.(channelId);

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
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    })
                );
            } catch (e) {
                console.error(e);
                return res;
            }
        })
    );
}

function onUnload() {
    patches.forEach((p) => p?.());
}

module.exports = {
    onLoad,
    onUnload
};
