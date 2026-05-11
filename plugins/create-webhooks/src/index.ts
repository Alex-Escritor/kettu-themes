import { findByName, findByProps } from "@vendetta/metro";
import { React, ReactNative, i18n } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { Forms } from "@vendetta/ui/components";

const patches: (() => void)[] = [];

const { View } = ReactNative;

const WebhookOverview = findByName(
    "ConnectedWebhooksOverview",
    false
);

const Button = Forms.Button;

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

export function onLoad() {
    console.log("[CreateWebhooks] loading");

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

                return (
                    <View style={styles.container}>
                        {res}

                        <Button
                            text={
                                i18n?.Messages?.WEBHOOK_CREATE ??
                                "Create Webhook"
                            }
                            style={styles.button}
                            onPress={() => {
                                try {
                                    WebhookActions?.create?.(
                                        channel.guild_id,
                                        channel.id,
                                        "Webhook"
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

export function onUnload() {
    patches.forEach((p) => p());
}

export default {
    onLoad,
    onUnload
};
