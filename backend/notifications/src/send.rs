use anyhow::Context;
use config::CONFIG;
use db::notification_subs::NotificationSub;
use serde_json::json;
use web_push::{
    ContentEncoding, IsahcWebPushClient, PartialVapidSignatureBuilder, SubscriptionInfo,
    VapidSignatureBuilder, WebPushClient, WebPushMessageBuilder, URL_SAFE_NO_PAD,
};

static CLIENT: once_cell::sync::Lazy<IsahcWebPushClient> = once_cell::sync::Lazy::new(|| {
    IsahcWebPushClient::new().expect("error creating static web push client")
});

static SIGNATURE_BUILDER: once_cell::sync::Lazy<PartialVapidSignatureBuilder> =
    once_cell::sync::Lazy::new(|| {
        VapidSignatureBuilder::from_base64_no_sub(&CONFIG.vapid_private_key, URL_SAFE_NO_PAD)
            .expect("error creating static vapid signature builder")
    });

pub async fn send_notification(
    sub: &NotificationSub,
    title: &str,
    message: &str,
) -> Result<(), anyhow::Error> {
    let subscription_info = SubscriptionInfo::new(
        sub.endpoint.to_owned(),
        sub.p256dh.to_owned(),
        sub.auth.to_owned(),
    );

    let signature = SIGNATURE_BUILDER
        .to_owned()
        .add_sub_info(&subscription_info)
        .build()
        .context("error building signature")?;

    let payload = json!({
        "title": title,
        "message": message,
    })
    .to_string();

    let mut message_builder = WebPushMessageBuilder::new(&subscription_info);
    message_builder.set_payload(ContentEncoding::Aes128Gcm, payload.as_bytes());
    message_builder.set_vapid_signature(signature);

    let message = message_builder.build().context("error building message")?;

    CLIENT
        .send(message)
        .await
        .context("error sending notification")?;

    return Ok(());
}
