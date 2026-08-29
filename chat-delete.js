// =========================================
// CALCULUS — CHAT MESSAGE DELETION
// =========================================
// Separate feature module
// Does NOT modify chat.js
//
// Features:
// • Delete icon below own messages
// • Delete for everyone
// • Delete for me
// • Independent conversation detection
// • Persistent "delete for me"
// =========================================


import {
    watchAuthState
} from "./auth.js";


import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    setDoc,
    query,
    where,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    app
} from "./firebase-config.js";


// =========================================
// FIRESTORE
// =========================================

const db =
    getFirestore(app);


// =========================================
// STATE
// =========================================

let currentUser =
    null;

let currentConversationId =
    null;

let selectedMessageId =
    null;

let unsubscribeMessages =
    null;

let deletedForMe =
    new Set();


// =========================================
// ELEMENTS
// =========================================

const messagesArea =
    document.getElementById(
        "messagesArea"
    );

const chatUserPlaceholder =
    document.getElementById(
        "chatUserPlaceholder"
    );


// =========================================
// CSS
// =========================================

const style =
    document.createElement(
        "style"
    );

style.textContent = `

    .chat-delete-wrapper {

        display: flex;
        justify-content: flex-end;
        align-items: center;

        margin-top: 3px;

        width: 100%;

    }


    .chat-delete-button {

        border: none;

        background: transparent;

        color:
            rgba(255,255,255,0.42);

        cursor: pointer;

        padding:
            4px 7px;

        font-size:
            0.78rem;

        opacity: 0;

        transition:
            opacity 0.2s ease,
            color 0.2s ease,
            background 0.2s ease;

    }


    .chat-message-own:hover
    + .chat-delete-wrapper
    .chat-delete-button {

        opacity: 1;

    }


    .chat-delete-button:hover {

        color: #fff;

        background:
            rgba(255,255,255,0.08);

    }


    /* PHONE */

    @media (max-width: 600px) {

        .chat-delete-button {

            opacity: 1;

        }

    }


    /* =====================================
       MODAL
    ====================================== */

    .chat-delete-modal {

        position: fixed;

        inset: 0;

        z-index: 100000;

        display: none;

        align-items: center;

        justify-content: center;

        padding: 20px;

        background:
            rgba(0,0,0,0.78);

        backdrop-filter:
            blur(10px);

        -webkit-backdrop-filter:
            blur(10px);

    }


    .chat-delete-modal.active {

        display: flex;

    }


    .chat-delete-box {

        width:
            min(430px, 100%);

        box-sizing:
            border-box;

        padding:
            2rem;

        background:
            #111;

        border:
            1px solid
            rgba(255,255,255,0.2);

        box-shadow:
            0 30px 100px
            rgba(0,0,0,0.65);

    }


    .chat-delete-box h2 {

        margin: 0;

        font-family:
            "Cormorant Garamond",
            serif;

        font-size:
            2.1rem;

        font-weight:
            600;

    }


    .chat-delete-box p {

        margin:
            0.8rem 0 1.4rem;

        color:
            rgba(255,255,255,0.55);

        font-size:
            0.85rem;

        line-height:
            1.6;

    }


    .chat-delete-option {

        display: flex;

        align-items: center;

        gap: 10px;

        padding:
            0.85rem 0;

        cursor: pointer;

        color: #fff;

        font-family:
            "Inter",
            sans-serif;

    }


    .chat-delete-option input {

        width: 17px;

        height: 17px;

    }


    .chat-delete-actions {

        display: flex;

        gap: 10px;

        margin-top:
            1.4rem;

    }


    .chat-delete-cancel,
    .chat-delete-confirm {

        flex: 1;

        padding:
            0.85rem;

        border:
            1px solid
            rgba(255,255,255,0.22);

        background:
            rgba(255,255,255,0.07);

        color: #fff;

        cursor: pointer;

        font-family:
            "Inter",
            sans-serif;

    }


    .chat-delete-cancel:hover,
    .chat-delete-confirm:hover {

        background:
            rgba(255,255,255,0.15);

    }

`;

document.head.appendChild(
    style
);


// =========================================
// CREATE MODAL
// =========================================

const modal =
    document.createElement(
        "div"
    );

modal.className =
    "chat-delete-modal";


modal.innerHTML = `

    <div
        class="chat-delete-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatDeleteTitle"
    >

        <h2 id="chatDeleteTitle">
            Delete message
        </h2>


        <p>
            Choose how you want to delete
            this message.
        </p>


        <label class="chat-delete-option">

            <input
                type="radio"
                name="chatDeleteType"
                value="everyone"
                checked
            >

            <span>
                Delete for everyone
            </span>

        </label>


        <label class="chat-delete-option">

            <input
                type="radio"
                name="chatDeleteType"
                value="me"
            >

            <span>
                Delete for me
            </span>

        </label>


        <div class="chat-delete-actions">

            <button
                type="button"
                class="chat-delete-cancel"
                id="chatDeleteCancel"
            >
                Cancel
            </button>


            <button
                type="button"
                class="chat-delete-confirm"
                id="chatDeleteConfirm"
            >
                Delete
            </button>

        </div>

    </div>

`;


document.body.appendChild(
    modal
);


// =========================================
// MODAL ELEMENTS
// =========================================

const cancelButton =
    document.getElementById(
        "chatDeleteCancel"
    );

const confirmButton =
    document.getElementById(
        "chatDeleteConfirm"
    );


// =========================================
// CLOSE MODAL
// =========================================

function closeDeleteModal() {

    modal.classList.remove(
        "active"
    );

    selectedMessageId =
        null;

}


// =========================================
// OPEN MODAL
// =========================================

function openDeleteModal(
    messageId
) {

    if (
        !messageId ||
        !currentConversationId
    ) {

        return;

    }


    selectedMessageId =
        messageId;


    const everyoneRadio =
        modal.querySelector(
            'input[value="everyone"]'
        );


    if (everyoneRadio) {

        everyoneRadio.checked =
            true;

    }


    modal.classList.add(
        "active"
    );

}


// =========================================
// CANCEL
// =========================================

cancelButton.addEventListener(
    "click",
    closeDeleteModal
);


// =========================================
// CLICK OUTSIDE
// =========================================

modal.addEventListener(
    "click",

    (event) => {

        if (
            event.target ===
            modal
        ) {

            closeDeleteModal();

        }

    }
);


// =========================================
// ESCAPE
// =========================================

document.addEventListener(
    "keydown",

    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeDeleteModal();

        }

    }
);


// =========================================
// GET DELETE TYPE
// =========================================

function getDeleteType() {

    const selected =
        modal.querySelector(
            'input[name="chatDeleteType"]:checked'
        );


    return selected
        ? selected.value
        : "everyone";

}


// =========================================
// DELETE FOR EVERYONE
// =========================================

async function deleteForEveryone(
    messageId
) {

    if (
        !currentUser ||
        !currentConversationId
    ) {

        throw new Error(
            "Chat conversation is not available."
        );

    }


    const messageRef =
        doc(
            db,
            "conversations",
            currentConversationId,
            "messages",
            messageId
        );


    await deleteDoc(
        messageRef
    );


    console.log(
        "Message deleted for everyone:",
        messageId
    );

}


// =========================================
// DELETE FOR ME
// =========================================

async function deleteForMe(
    messageId
) {

    if (
        !currentUser ||
        !currentConversationId
    ) {

        throw new Error(
            "Chat conversation is not available."
        );

    }


    const deletedRef =
        doc(
            db,
            "conversations",
            currentConversationId,
            "messages",
            messageId,
            "deletedForMe",
            currentUser.uid
        );


    await setDoc(
        deletedRef,
        {

            uid:
                currentUser.uid,

            deletedAt:
                serverTimestamp()

        }
    );


    deletedForMe.add(
        messageId
    );


    hideMessage(
        messageId
    );


    console.log(
        "Message deleted for me:",
        messageId
    );

}


// =========================================
// CONFIRM DELETE
// =========================================

confirmButton.addEventListener(
    "click",

    async () => {

        if (
            !selectedMessageId
        ) {

            closeDeleteModal();

            return;

        }


        const messageId =
            selectedMessageId;


        const deleteType =
            getDeleteType();


        confirmButton.disabled =
            true;


        confirmButton.textContent =
            "Deleting...";


        try {

            if (
                deleteType ===
                "everyone"
            ) {

                await deleteForEveryone(
                    messageId
                );

            }

            else {

                await deleteForMe(
                    messageId
                );

            }


            closeDeleteModal();

        }

        catch (error) {

            console.error(
                "Message deletion failed:",
                error
            );


            alert(
                "The message could not be deleted. Please try again."
            );

        }

        finally {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Delete";

        }

    }
);


// =========================================
// HIDE MESSAGE
// =========================================

function hideMessage(
    messageId
) {

    if (!messagesArea) {

        return;

    }


    const message =
        messagesArea.querySelector(
            `[data-delete-message-id="${CSS.escape(messageId)}"]`
        );


    if (!message) {

        return;

    }


    message.style.display =
        "none";


    const wrapper =
        message.nextElementSibling;


    if (
        wrapper &&
        wrapper.classList.contains(
            "chat-delete-wrapper"
        )
    ) {

        wrapper.style.display =
            "none";

    }

}


// =========================================
// FIND SELECTED USER
// =========================================
//
// chat.js doesn't expose selectedUser.
// We therefore use the visible name in
// chatUserPlaceholder and locate that user
// in publicUsers.
//
// =========================================

async function detectConversation() {

    if (
        !currentUser ||
        !chatUserPlaceholder
    ) {

        return null;

    }


    const selectedName =
        chatUserPlaceholder.textContent.trim();


    if (
        !selectedName ||
        selectedName ===
        "Select a conversation to start chatting."
    ) {

        return null;

    }


    try {

        const publicUsersRef =
            collection(
                db,
                "publicUsers"
            );


        const snapshot =
            await getDocs(
                publicUsersRef
            );


        let otherUser =
            null;


        snapshot.forEach(
            (userDoc) => {

                const user =
                    userDoc.data();


                if (
                    user.uid ===
                    currentUser.uid
                ) {

                    return;

                }


                if (
                    (
                        user.displayName ||
                        ""
                    ).trim() ===
                    selectedName
                ) {

                    otherUser =
                        user;

                }

            }
        );


        if (!otherUser) {

            return null;

        }


        const participantIds = [

            currentUser.uid,
            otherUser.uid

        ].sort();


        return participantIds.join(
            "_"
        );

    }

    catch (error) {

        console.error(
            "Conversation detection failed:",
            error
        );


        return null;

    }

}


// =========================================
// WATCH CURRENT CONVERSATION
// =========================================

async function updateConversation() {

    const conversationId =
        await detectConversation();


    if (
        !conversationId
    ) {

        return;

    }


    if (
        conversationId ===
        currentConversationId
    ) {

        return;

    }


    currentConversationId =
        conversationId;


    console.log(
        "Delete feature conversation:",
        currentConversationId
    );

}


// =========================================
// DECORATE RENDERED MESSAGES
// =========================================
//
// chat.js does not expose message IDs.
// We therefore independently retrieve the
// selected conversation's messages and match
// them to the rendered messages by sender,
// text and order.
//
// =========================================

async function decorateMessages() {

    if (
        !currentUser ||
        !messagesArea
    ) {

        return;

    }


    await updateConversation();


    if (!currentConversationId) {

        return;

    }


    try {

        const messagesRef =
            collection(
                db,
                "conversations",
                currentConversationId,
                "messages"
            );


        const snapshot =
            await getDocs(
                messagesRef
            );


        const firestoreMessages = [];


        snapshot.forEach(
            (messageDoc) => {

                const data =
                    messageDoc.data();


                firestoreMessages.push({

                    id:
                        messageDoc.id,

                    senderId:
                        data.senderId,

                    text:
                        data.text || "",

                    createdAt:
                        data.createdAt

                });

            }
        );


        const renderedMessages =
            Array.from(
                messagesArea.querySelectorAll(
                    ".chat-message"
                )
            );


        /*
           Match rendered messages with Firestore
           messages in their rendered order.

           chat.js displays messages in ascending
           createdAt order, so the same ordering
           can be used here.
        */

        const used =
            new Set();


        renderedMessages.forEach(
            (messageElement) => {

                if (
                    messageElement.dataset
                        .deleteMessageId
                ) {

                    return;

                }


                const text =
                    messageElement.textContent;


                const isOwn =
                    messageElement.classList.contains(
                        "chat-message-own"
                    );


                const senderId =
                    isOwn
                        ? currentUser.uid
                        : null;


                let match =
                    null;


                for (
                    const firestoreMessage
                    of firestoreMessages
                ) {

                    if (
                        used.has(
                            firestoreMessage.id
                        )
                    ) {

                        continue;

                    }


                    if (
                        senderId &&
                        firestoreMessage.senderId !==
                        senderId
                    ) {

                        continue;

                    }


                    if (
                        firestoreMessage.text !==
                        text
                    ) {

                        continue;

                    }


                    match =
                        firestoreMessage;

                    break;

                }


                if (!match) {

                    return;

                }


                used.add(
                    match.id
                );


                messageElement.dataset
                    .deleteMessageId =
                    match.id;


                messageElement.dataset
                    .senderId =
                    match.senderId;


                /*
                   Check Delete for me.
                */

                checkDeletedForMe(
                    match.id
                )
                .then(
                    (deleted) => {

                        if (deleted) {

                            hideMessage(
                                match.id
                            );

                        }

                    }
                );


                /*
                   Delete button only for
                   the sender.
                */

                if (
                    match.senderId !==
                    currentUser.uid
                ) {

                    return;

                }


                addDeleteButton(
                    messageElement,
                    match.id
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Could not decorate messages:",
            error
        );

    }

}


// =========================================
// CHECK DELETE FOR ME
// =========================================

async function checkDeletedForMe(
    messageId
) {

    if (
        !currentUser ||
        !currentConversationId
    ) {

        return false;

    }


    try {

        const deletedRef =
            doc(
                db,
                "conversations",
                currentConversationId,
                "messages",
                messageId,
                "deletedForMe",
                currentUser.uid
            );


        const snapshot =
            await getDoc(
                deletedRef
            );


        if (
            snapshot.exists()
        ) {

            deletedForMe.add(
                messageId
            );


            return true;

        }

    }

    catch (error) {

        console.error(
            "Delete-for-me check failed:",
            error
        );

    }


    return false;

}


// =========================================
// ADD DELETE BUTTON
// =========================================

function addDeleteButton(
    messageElement,
    messageId
) {

    if (
        messageElement.nextElementSibling &&
        messageElement.nextElementSibling.classList.contains(
            "chat-delete-wrapper"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "chat-delete-wrapper";


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "chat-delete-button";


    button.textContent =
        "🗑";


    button.title =
        "Delete message";


    button.setAttribute(
        "aria-label",
        "Delete message"
    );


    button.addEventListener(
        "click",

        () => {

            openDeleteModal(
                messageId
            );

        }
    );


    wrapper.appendChild(
        button
    );


    messageElement.after(
        wrapper
    );

}


// =========================================
// OBSERVE CHAT DOM
// =========================================

if (messagesArea) {

    const observer =
        new MutationObserver(
            () => {

                if (!currentUser) {

                    return;

                }


                /*
                   Give chat.js a moment to finish
                   rendering its snapshot.
                */

                clearTimeout(
                    observer.decorateTimer
                );


                observer.decorateTimer =
                    setTimeout(
                        () => {

                            decorateMessages();

                        },
                        100
                    );

            }
        );


    observer.observe(
        messagesArea,
        {

            childList:
                true,

            subtree:
                true

        }
    );

}


// =========================================
// WATCH HEADER FOR CONVERSATION CHANGES
// =========================================

if (chatUserPlaceholder) {

    const headerObserver =
        new MutationObserver(
            () => {

                if (!currentUser) {

                    return;

                }


                currentConversationId =
                    null;


                decorateMessages();

            }
        );


    headerObserver.observe(
        chatUserPlaceholder,
        {

            childList:
                true,

            characterData:
                true,

            subtree:
                true

        }
    );

}


// =========================================
// AUTHENTICATION
// =========================================

watchAuthState(
    async (user) => {

        currentUser =
            user;


        currentConversationId =
            null;


        deletedForMe =
            new Set();


        if (
            unsubscribeMessages
        ) {

            unsubscribeMessages();

            unsubscribeMessages =
                null;

        }


        if (!user) {

            return;

        }


        console.log(
            "Chat delete feature ready for:",
            user.uid
        );

    }
);


// =========================================
// FEATURE READY
// =========================================

console.log(
    "CALCULUS Chat Delete feature loaded."
);
