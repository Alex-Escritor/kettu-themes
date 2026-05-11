import { findByName, findByProps } from "@vendetta/metro";
import { React, ReactNative, i18n } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

const patches = [];

const { View } = ReactNative;

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
    console.log("CREATE WEBHOOKS LOADED");

    if (!WebhookOverview) {
        console.log("WebhookOverview not found");
        return;
    }

    patches.push(
        after("default", WebhookOverview, (args, res) => {
            try {
                const channelId = args?.[0]?.channelId;
                const channel = ChannelStore?.getChannel?.(channelId);

                if (!channel) return res;

                return (
                    <View style={styles.container}>
                        {res}

                        <Button
                            text={
                                i18n?.Messages?.WEBHOOK_CREATE ??
                                "Create Webhook"
                            }
                            style={styles.button}
                            color="brand"
                            onPress={() => {
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
                            }}
                        />
                    </View>
                );
            } catch (e) {
                console.error(e);
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
