use sha2::{Digest, Sha256};

pub struct Token {
    pub user_id: String,
    pub session_id: String,
}

static ID_SPLITTER: &str = ".";
static SIGNATURE_SPLITTER: &str = ":";

fn create_signature(data_to_sign: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(&data_to_sign);
    let result = hasher.finalize();

    return result.iter().map(|b| format!("{:02x}", b)).collect();
}

pub fn create_token(user_id: &str, session_id: &str) -> String {
    let data = format!("{user_id}{ID_SPLITTER}{session_id}");

    let signature = create_signature(&data);

    return format!("{data}{SIGNATURE_SPLITTER}{signature}");
}

pub fn verify_token(token: &str) -> Result<Token, anyhow::Error> {
    let parts: Vec<&str> = token.split(SIGNATURE_SPLITTER).collect();

    if parts.len() != 2 {
        return Err(anyhow::anyhow!(
            "could not split token into data and signature"
        ));
    }

    let data = parts[0];
    let signature = parts[1];

    let expected_signature = create_signature(data);

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
