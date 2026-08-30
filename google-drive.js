// =========================================
// CALCULUS — GOOGLE DRIVE MEDIA AUTH
// =========================================
// Google Drive OAuth access-token helper
// =========================================

const GOOGLE_CLIENT_ID =
    "174983915941-tkdu7o57lgvjqmiu70ggukg3hldp4ma3.apps.googleusercontent.com";

const DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.file";

let tokenClient = null;

let accessToken = null;


// =========================================
// INITIALIZE GOOGLE DRIVE AUTH
// =========================================

function initializeGoogleDrive() {

    if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.oauth2
    ) {

        console.error(
            "Google Identity Services has not loaded yet."
        );

        return false;

    }


    tokenClient =
        window.google.accounts.oauth2.initTokenClient({

            client_id:
                GOOGLE_CLIENT_ID,

            scope:
                DRIVE_SCOPE,

            callback:
                (response) => {

                    if (response.error) {

                        console.error(
                            "Google Drive authorization failed:",
                            response
                        );

                        return;

                    }


                    accessToken =
                        response.access_token;


                    console.log(
                        "Google Drive access token obtained."
                    );

                }

        });


    return true;

}


// =========================================
// REQUEST DRIVE ACCESS
// =========================================

export function requestGoogleDriveAccess() {

    return new Promise(
        (resolve, reject) => {

            if (!tokenClient) {

                const initialized =
                    initializeGoogleDrive();


                if (!initialized) {

                    reject(
                        new Error(
                            "Google Identity Services is not ready."
                        )
                    );

                    return;

                }

            }


            tokenClient.callback =
                (response) => {

                    if (
                        response.error
                    ) {

                        console.error(
                            "Google Drive authorization error:",
                            response
                        );

                        reject(
                            new Error(
                                "Google Drive authorization was denied."
                            )
                        );

                        return;

                    }


                    accessToken =
                        response.access_token;


                    resolve(
                        accessToken
                    );

                };


            tokenClient.requestAccessToken();

        }
    );

}


// =========================================
// GET CURRENT ACCESS TOKEN
// =========================================

export function getGoogleDriveAccessToken() {

    return accessToken;

}


// =========================================
// INITIALIZATION
// =========================================

window.addEventListener(
    "load",
    () => {

        initializeGoogleDrive();

    }
);


console.log(
    "CALCULUS Google Drive module loaded."
);
