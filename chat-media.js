// =========================================
// CALCULUS — CHAT MEDIA
// =========================================
// Step 1:
// Images + Videos + Files
// =========================================

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

import {
    app
} from "./firebase-config.js";

import {
    watchAuthState
} from "./auth.js";


// =========================================
// FIREBASE STORAGE
// =========================================

const storage =
    getStorage(app);


// =========================================
// STATE
// =========================================

let currentUser = null;


// =========================================
// ELEMENTS
// =========================================

const messageComposer =
    document.getElementById(
        "messageComposer"
    );

const messagesArea =
    document.getElementById(
        "messagesArea"
    );


// =========================================
// CREATE ATTACHMENT BUTTON
// =========================================

if (messageComposer) {

    const attachmentButton =
        document.createElement("button");

    attachmentButton.type =
        "button";

    attachmentButton.className =
        "media-button";

    attachmentButton.id =
        "mediaButton";

    attachmentButton.setAttribute(
        "aria-label",
        "Attach image, video or file"
    );

    attachmentButton.title =
        "Attach image, video or file";

    attachmentButton.textContent =
        "📎";


    /*
       Put the attachment button before
       the existing emoji button.
    */

    const emojiButton =
        document.getElementById(
            "emojiButton"
        );

    if (emojiButton) {

        messageComposer.insertBefore(
            attachmentButton,
            emojiButton
        );

    }

    else {

        messageComposer.prepend(
            attachmentButton
        );

    }


    // =====================================
    // HIDDEN FILE INPUT
    // =====================================

    const fileInput =
        document.createElement("input");

    fileInput.type =
        "file";

    fileInput.id =
        "chatMediaInput";

    fileInput.accept =
        "image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip";

    fileInput.multiple =
        false;

    fileInput.style.display =
        "none";


    document.body.appendChild(
        fileInput
    );


    // =====================================
    // OPEN FILE PICKER
    // =====================================

    attachmentButton.addEventListener(
        "click",
        () => {

            if (!currentUser) {

                alert(
                    "Please sign in first."
                );

                return;

            }

            fileInput.click();

        }
    );


    // =====================================
    // FILE SELECTED
    // =====================================

    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files?.[0];


            if (!file) {

                return;

            }


            await uploadChatMedia(
                file
            );


            /*
               Allow selecting the same file
               again later.
            */

            fileInput.value =
                "";

        }
    );

}


// =========================================
// UPLOAD MEDIA
// =========================================

async function uploadChatMedia(
    file
) {

    if (!currentUser) {

        alert(
            "Please sign in first."
        );

        return;

    }


    // =====================================
    // FILE SIZE LIMIT
    // =====================================

    /*
       Step 1 limit:
       25 MB per file.
    */

    const MAX_FILE_SIZE =
        25 * 1024 * 1024;


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        alert(
            "This file is too large. The maximum size is 25 MB."
        );

        return;

    }


    // =====================================
    // ALLOWED TYPES
    // =====================================

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",

        "video/mp4",
        "video/webm",
        "video/quicktime",

        "application/pdf",

        "text/plain",

        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "application/zip"

    ];


    if (
        file.type &&
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "This file type is not supported."
        );

        return;

    }


    // =====================================
    // SHOW UPLOAD MESSAGE
    // =====================================

    const uploadMessage =
        document.createElement(
            "div"
        );

    uploadMessage.className =
        "chat-media-upload";


    const uploadText =
        document.createElement(
            "span"
        );

    uploadText.textContent =
        `Uploading ${file.name}...`;


    const progress =
        document.createElement(
            "progress"
        );

    progress.max =
        100;

    progress.value =
        0;


    uploadMessage.appendChild(
        uploadText
    );

    uploadMessage.appendChild(
        progress
    );


    if (messagesArea) {

        messagesArea.appendChild(
            uploadMessage
        );

        messagesArea.scrollTop =
            messagesArea.scrollHeight;

    }


    try {

        // =================================
        // UNIQUE STORAGE PATH
        // =================================

        const safeFileName =
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const storagePath =
            `chatMedia/${currentUser.uid}/${Date.now()}_${safeFileName}`;


        const storageRef =
            ref(
                storage,
                storagePath
            );


        // =================================
        // UPLOAD
        // =================================

        const uploadTask =
            uploadBytesResumable(
                storageRef,
                file,
                {
                    contentType:
                        file.type ||
                        "application/octet-stream"
                }
            );


        uploadTask.on(

            "state_changed",

            (snapshot) => {

                const percent =
                    (
                        snapshot.bytesTransferred /
                        snapshot.totalBytes
                    ) * 100;


                progress.value =
                    percent;


                uploadText.textContent =
                    `Uploading ${file.name} — ${Math.round(percent)}%`;

            },


            (error) => {

                console.error(
                    "Media upload failed:",
                    error
                );


                uploadMessage.remove();


                alert(
                    "The file could not be uploaded. Please try again."
                );

            },


            async () => {

                const downloadURL =
                    await getDownloadURL(
                        uploadTask.snapshot.ref
                    );


                console.log(
                    "Media uploaded:",
                    downloadURL
                );


                uploadText.textContent =
                    `${file.name} uploaded successfully.`;


                progress.value =
                    100;

            }

        );

    }

    catch (error) {

        console.error(
            "Media upload error:",
            error
        );


        uploadMessage.remove();


        alert(
            "The file could not be uploaded."
        );

    }

}


// =========================================
// AUTHENTICATION
// =========================================

watchAuthState(
    (user) => {

        currentUser =
            user;

    }
);


console.log(
    "CALCULUS Chat Media feature loaded."
);
