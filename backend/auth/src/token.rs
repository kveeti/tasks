use hmac::{Hmac, Mac};
use sha2::Sha256;

pub struct Token {
    pub user_id: String,
    pub session_id: String,
}

static ID_SPLITTER: &str = ".";
static SIGNATURE_SPLITTER: &str = ":";

type HmacSha256 = Hmac<Sha256>;

fn create_signature(secret: &str, data_to_sign: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("error creating hmac");

    mac.update(data_to_sign.as_bytes());

    let result = mac.finalize();
    let result = result.into_bytes();

    return hex::encode(result);
}

pub fn create_token(secret: &str, user_id: &str, session_id: &str) -> String {
    let data = format!("{user_id}{ID_SPLITTER}{session_id}");

    let signature = create_signature(secret, &data);

    return format!("{data}{SIGNATURE_SPLITTER}{signature}");
}

pub fn verify_token(secret: &str, token: &str) -> Result<Token, anyhow::Error> {
    let parts: Vec<&str> = token.split(SIGNATURE_SPLITTER).collect();

    if parts.len() != 2 {
        return Err(anyhow::anyhow!(
            "could not split token into data and signature"
        ));
    }

    let data = parts[0];
    let signature = parts[1];

    let expected_signature = create_signature(secret, data);

    if signature != expected_signature {
        return Err(anyhow::anyhow!("invalid signature"));
    }

    let parts: Vec<&str> = data.split(ID_SPLITTER).collect();

    if parts.len() != 2 {
        return Err(anyhow::anyhow!(
            "could not split token data into user_id and session_id"
        ));
    }

    let user_id = parts[0];
    let session_id = parts[1];

    return Ok(Token {
        user_id: user_id.to_string(),
        session_id: session_id.to_string(),
    });
}
