import {
    requestGoogleDriveAccess
} from "./google-drive.js";

const button =
    document.createElement("button");

button.textContent =
    "Test Google Drive";

button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    padding: 12px 18px;
    background: #111;
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    cursor: pointer;
`;

document.body.appendChild(button);

button.addEventListener(
    "click",
    async () => {

        try {

            const token =
                await requestGoogleDriveAccess();

            console.log(
                "Drive authorization successful."
            );

            alert(
                "Google Drive authorization successful!"
            );

        }

        catch (error) {

            console.error(
                "Drive authorization failed:",
                error
            );

            alert(
                "Google Drive authorization failed."
            );

        }

    }
);
