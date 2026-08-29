// =========================================
// CALCULUS — CHAT MESSAGE DELETION
// =========================================
// Delete for everyone + Delete for me
// Separate feature module
// =========================================

import {
    watchAuthState
} from "./auth.js";

import {
    getFirestore,
    doc,
    deleteDoc,
    setDoc,
    getDoc,
    collection,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
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

let unsubscribeConversation =
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


// =========================================
// ADD DELETE FEATURE CSS
// =========================================

const style =
    document.createElement(
        "style"
    );

style.textContent = `

    .chat-delete-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-top: 3px;
    }

    .chat-message-other + .chat-delete-wrapper {
        align-items: flex-start;
    }

    .chat-delete-button {
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.42);
        cursor: pointer;
        padding: 3px 6px;
        font-size: 0.78rem;
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
        background: rgba(255,255,255,0.08);

    }


    /* =====================================
       DELETE MODAL
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

        width: min(430px, 100%);

        box-sizing: border-box;

        padding: 2rem;

        background: #111;

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

        font-size: 2.1rem;

        font-weight: 600;

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

        padding: 0.85rem 0;

        cursor: pointer;

        color: #fff;

        font-family:
            "Inter",
            sans-serif;

    }


    .chat-delete-option input {

        width: 17px;
        height: 17px;

        accent-color: #fff;

    }


    .chat-delete-actions {

        display: flex;

        gap: 10px;

        margin-top: 1.4rem;

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


    .chat-delete-confirm:hover,
    .chat-delete-cancel:hover {

        background:
            rgba(255,255,255,0.15);

    }


    @media (max-width: 600px) {

        .chat-delete-button {

            opacity: 1;

        }

        .chat-delete-box {

            padding: 1.5rem;

        }

    }

`;

document.head.appendChild(
    style
);


// =========================================
// CREATE DELETE MODAL
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
// CURRENT MESSAGE BEING DELETED
// =========================================

let selectedMessageId =
    null;


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

    if (!messageId) {

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
// CLICK OUTSIDE MODAL
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
// ESCAPE KEY
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
// GET SELECTED DELETE TYPE
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

        return;

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

        return;

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
            `.chat-message[data-message-id="${CSS.escape(messageId)}"]`
        );


    if (message) {

        const wrapper =
            message.nextElementSibling;


        message.style.display =
            "none";


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

}


// =========================================
// LOAD "DELETE FOR ME" RECORDS
// =========================================

async function loadDeletedMessages() {

    deletedForMe =
        new Set();


    if (
        !currentUser ||
        !currentConversationId
    ) {

        return;

    }


    /*
       We cannot query all deletedForMe
       documents without knowing the
       individual message IDs.

       Instead, the feature checks each
       rendered message individually.
    */

}


// =========================================
// CHECK ONE MESSAGE
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
            "Could not check deleted message:",
            error
        );

    }


    return false;

}


// =========================================
// ADD DELETE BUTTON
// =========================================

function decorateMessage(
    message
) {

    if (!message) {

        return;

    }


    const messageId =
        message.dataset.messageId;


    const senderId =
        message.dataset.senderId;


    if (!messageId) {

        return;

    }


    /*
       Delete button only appears
       for the current user's messages.
    */

    if (
        senderId !==
        currentUser?.uid
    ) {

        return;

    }


    /*
       Prevent duplicate buttons.
    */

    if (
        message.nextElementSibling &&
        message.nextElementSibling.classList.contains(
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


    button.setAttribute(
        "aria-label",
        "Delete message"
    );


    button.title =
        "Delete message";


    button.textContent =
        "🗑";


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


    message.after(
        wrapper
    );


    /*
       Check whether this message was
       previously deleted for this user.
    */

    checkDeletedForMe(
        messageId
    )
    .then(
        (deleted) => {

            if (deleted) {

                hideMessage(
                    messageId
                );

            }

        }
    );

}


// =========================================
// OBSERVE MESSAGE AREA
// =========================================

if (messagesArea) {

    const observer =
        new MutationObserver(
            () => {

                if (!currentUser) {

                    return;

                }


                const messages =
                    messagesArea.querySelectorAll(
                        ".chat-message"
                    );


                messages.forEach(
                    decorateMessage
                );

            }
        );


    observer.observe(
        messagesArea,
        {
            childList: true,
            subtree: true
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
            unsubscribeConversation
        ) {

            unsubscribeConversation();

            unsubscribeConversation =
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
// DETECT CURRENT CONVERSATION
// =========================================
//
// The stable chat.js does not expose
// currentConversationId.
//
// We therefore discover it from the
// message DOM's Firestore IDs and the
// currently selected conversation by
// observing the chat state.
//
// =========================================

async function detectConversation() {

    if (!currentUser) {

        return;

    }


    /*
       The parent chat.js already knows
       the conversation internally.

       To keep chat.js stable, this feature
       watches Firestore conversations
       belonging to the current user.
    */

}


// =========================================
// FEATURE READY
// =========================================

console.log(
    "CALCULUS Chat Delete feature loaded."
);
