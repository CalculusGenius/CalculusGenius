// =========================================
// CALCULUS — CHAT PAGE
// =========================================
// One-to-one text chat
// Firebase Authentication + Firestore
// Custom Chat Name system
// =========================================


import {
    watchAuthState
} from "./auth.js";


import {
    getFirestore,
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    getDoc,
    addDoc,
    serverTimestamp,
    orderBy,
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
// ELEMENTS
// =========================================

const chatLoginNotice =
    document.getElementById(
        "chatLoginNotice"
    );


const messageComposer =
    document.getElementById(
        "messageComposer"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const emojiButton =
    document.getElementById(
        "emojiButton"
    );


const conversationList =
    document.getElementById(
        "conversationList"
    );


const messagesArea =
    document.getElementById(
        "messagesArea"
    );


const chatUserPlaceholder =
    document.getElementById(
        "chatUserPlaceholder"
    );


const chatSearch =
    document.getElementById(
        "chatSearch"
    );


// =========================================
// CHAT NAME MODAL ELEMENTS
// =========================================

const chatNameModal =
    document.getElementById(
        "chatNameModal"
    );


const chatNameInput =
    document.getElementById(
        "chatNameInput"
    );


const chatNameError =
    document.getElementById(
        "chatNameError"
    );


const saveChatNameButton =
    document.getElementById(
        "saveChatNameButton"
    );



// =========================================
// STATE
// =========================================

let currentUser =
    null;


let selectedUser =
    null;


let currentConversationId =
    null;


let unsubscribeMessages =
    null;


let chatNameReady =
    false;


let chatNameSaveResolver =
    null;



// =========================================
// SHOW CHAT NAME MODAL
// =========================================

function showChatNameModal() {

    if (!chatNameModal) {

        console.error(
            "Chat Name modal was not found in chat.html."
        );

        return;

    }


    chatNameModal.classList.add(
        "active"
    );


    chatNameModal.setAttribute(
        "aria-hidden",
        "false"
    );


    if (chatNameError) {

        chatNameError.textContent =
            "";

    }


    if (chatNameInput) {

        chatNameInput.value =
            "";

        setTimeout(
            () => {

                chatNameInput.focus();

            },
            100
        );

    }

}



// =========================================
// HIDE CHAT NAME MODAL
// =========================================

function hideChatNameModal() {

    if (!chatNameModal) {

        return;

    }


    chatNameModal.classList.remove(
        "active"
    );


    chatNameModal.setAttribute(
        "aria-hidden",
        "true"
    );

}



// =========================================
// ASK FOR CHAT NAME
// =========================================

function requestChatName() {

    return new Promise(
        (resolve) => {

            chatNameSaveResolver =
                resolve;


            showChatNameModal();

        }
    );

}



// =========================================
// SAVE CHAT NAME BUTTON
// =========================================

if (saveChatNameButton) {

    saveChatNameButton.addEventListener(
        "click",

        async () => {

            if (!currentUser) {

                return;

            }


            let chatName =
                chatNameInput
                    ? chatNameInput.value.trim()
                    : "";


            // =================================
            // EMPTY NAME
            // =================================

            if (!chatName) {

                if (chatNameError) {

                    chatNameError.textContent =
                        "Please enter a Chat Name.";

                }


                if (chatNameInput) {

                    chatNameInput.focus();

                }


                return;

            }


            // =================================
            // LENGTH
            // =================================

            if (
                chatName.length > 30
            ) {

                if (chatNameError) {

                    chatNameError.textContent =
                        "Chat Name must be 30 characters or fewer.";

                }


                return;

            }


            // =================================
            // SAVE
            // =================================

            saveChatNameButton.disabled =
                true;


            saveChatNameButton.textContent =
                "Saving...";


            try {

                const publicUserRef =
                    doc(
                        db,
                        "publicUsers",
                        currentUser.uid
                    );


                await setDoc(
                    publicUserRef,
                    {

                        uid:
                            currentUser.uid,

                        chatName:
                            chatName,

                        photoURL:
                            currentUser.photoURL || ""

                    },

                    {
                        merge: true
                    }
                );


                console.log(
                    "Chat Name saved:",
                    chatName
                );


                hideChatNameModal();


                chatNameReady =
                    true;


                if (chatNameSaveResolver) {

                    chatNameSaveResolver(
                        chatName
                    );

                    chatNameSaveResolver =
                        null;

                }

            }

            catch (error) {

                console.error(
                    "Chat Name save failed:",
                    error
                );


                if (chatNameError) {

                    chatNameError.textContent =
                        "Could not save your Chat Name. Please try again.";

                }

            }


            finally {

                saveChatNameButton.disabled =
                    false;

                saveChatNameButton.textContent =
                    "Continue";

            }

        }
    );

}



// =========================================
// ENTER KEY IN CHAT NAME INPUT
// =========================================

if (chatNameInput) {

    chatNameInput.addEventListener(
        "keydown",

        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                if (saveChatNameButton) {

                    saveChatNameButton.click();

                }

            }

        }
    );

}



// =========================================
// GET CURRENT CHAT NAME
// =========================================

async function ensureChatName(user) {

    if (!user) {

        return null;

    }


    const publicUserRef =
        doc(
            db,
            "publicUsers",
            user.uid
        );


    try {

        const snapshot =
            await getDoc(
                publicUserRef
            );


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.data();


            /*
               IMPORTANT:

               We ONLY check chatName.

               We NEVER use Google's
               displayName here.
            */

            if (
                typeof data.chatName ===
                    "string"
                &&
                data.chatName.trim() !== ""
            ) {

                console.log(
                    "Existing Chat Name:",
                    data.chatName
                );


                chatNameReady =
                    true;


                return data.chatName.trim();

            }

        }


        // =================================
        // NO CHAT NAME
        // =================================

        chatNameReady =
            false;


        return await requestChatName();

    }

    catch (error) {

        console.error(
            "Chat profile error:",
            error
        );


        alert(
            "Could not load your Chat profile. Please refresh the page."
        );


        return null;

    }

}



// =========================================
// AUTHENTICATION
// =========================================

watchAuthState(
    async (user) => {

        currentUser =
            user;


        // =====================================
        // LOGGED IN
        // =====================================

        if (user) {

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "none";

            }


            if (messageInput) {

                messageInput.disabled =
                    true;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    true;

            }


            /*
               First determine the user's
               Chat Name.

               This happens only on chat.html.
            */

            const chatName =
                await ensureChatName(
                    user
                );


            if (!chatName) {

                return;

            }


            // =================================
            // CHAT NAME READY
            // =================================

            if (messageInput) {

                messageInput.disabled =
                    false;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    false;

            }


            if (conversationList) {

                conversationList.innerHTML =
                    "";


                const placeholder =
                    document.createElement(
                        "div"
                    );


                placeholder.className =
                    "conversation-placeholder";


                placeholder.textContent =
                    "Search for a member to start chatting.";


                conversationList.appendChild(
                    placeholder
                );

            }

        }


        // =====================================
        // LOGGED OUT
        // =====================================

        else {

            chatNameReady =
                false;


            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "block";

            }


            if (messageInput) {

                messageInput.disabled =
                    true;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    true;

            }


            if (conversationList) {

                conversationList.innerHTML =
                    "";


                const placeholder =
                    document.createElement(
                        "div"
                    );


                placeholder.className =
                    "conversation-placeholder";


                placeholder.textContent =
                    "Please sign in to use Chat.";


                conversationList.appendChild(
                    placeholder
                );

            }


            selectedUser =
                null;


            currentConversationId =
                null;


            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages =
                    null;

            }

        }

    }
);



// =========================================
// FIND / CREATE CONVERSATION
// =========================================

async function getOrCreateConversation(
    otherUser
) {

    if (!currentUser) {

        return null;

    }


    const participantIds = [

        currentUser.uid,

        otherUser.uid

    ].sort();


    const conversationId =
        participantIds.join("_");


    const conversationRef =
        doc(
            db,
            "conversations",
            conversationId
        );


    await setDoc(
        conversationRef,
        {

            participantIds:
                participantIds,

            createdAt:
                serverTimestamp()

        },

        {
            merge: true
        }
    );


    return conversationId;

}



// =========================================
// SELECT USER
// =========================================

async function selectUser(user) {

    if (!currentUser) {

        return;

    }


    if (!chatNameReady) {

        return;

    }


    if (
        user.uid ===
        currentUser.uid
    ) {

        return;

    }


    selectedUser =
        user;


    // =====================================
    // UPDATE CHAT HEADER
    // =====================================

    if (chatUserPlaceholder) {

        /*
           ONLY chatName is displayed.
        */

        chatUserPlaceholder.textContent =
            user.chatName ||
            "CALCULUS User";

    }


    // =====================================
    // CLEAR OLD LISTENER
    // =====================================

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    // =====================================
    // CREATE / GET CONVERSATION
    // =====================================

    try {

        currentConversationId =
            await getOrCreateConversation(
                user
            );

    }

    catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        return;

    }


    if (!currentConversationId) {

        return;

    }


    listenForMessages(
        currentConversationId
    );

}



// =========================================
// LISTEN FOR MESSAGES
// =========================================

function listenForMessages(
    conversationId
) {

    if (!messagesArea) {

        return;

    }


    const messagesRef =
        collection(
            db,
            "conversations",
            conversationId,
            "messages"
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );


    unsubscribeMessages =
        onSnapshot(
            messagesQuery,

            (snapshot) => {

                messagesArea.innerHTML =
                    "";


                if (snapshot.empty) {

                    const empty =
                        document.createElement(
                            "div"
                        );


                    empty.className =
                        "messages-empty";


                    const heading =
                        document.createElement(
                            "h2"
                        );


                    heading.textContent =
                        "Start the conversation";


                    const paragraph =
                        document.createElement(
                            "p"
                        );


                    paragraph.textContent =
                        "Send the first message.";


                    empty.appendChild(
                        heading
                    );


                    empty.appendChild(
                        paragraph
                    );


                    messagesArea.appendChild(
                        empty
                    );


                    return;

                }


                snapshot.forEach(
                    (messageDoc) => {

                        const data =
                            messageDoc.data();


                        const message =
                            document.createElement(
                                "div"
                            );


                        message.className =
                            "chat-message";


                        if (
                            data.senderId ===
                            currentUser.uid
                        ) {

                            message.classList.add(
                                "chat-message-own"
                            );

                        }

                        else {

                            message.classList.add(
                                "chat-message-other"
                            );

                        }


                        /*
                           textContent prevents
                           message text from being
                           interpreted as HTML.
                        */

                        message.textContent =
                            data.text || "";


                        messagesArea.appendChild(
                            message
                        );

                    }
                );


                messagesArea.scrollTop =
                    messagesArea.scrollHeight;

            },

            (error) => {

                console.error(
                    "Message listener error:",
                    error
                );

            }
        );

}



// =========================================
// SEND MESSAGE
// =========================================

if (messageComposer) {

    messageComposer.addEventListener(
        "submit",

        async (event) => {

            event.preventDefault();


            if (!currentUser) {

                return;

            }


            if (!chatNameReady) {

                return;

            }


            if (!selectedUser) {

                alert(
                    "Select a user before sending a message."
                );


                return;

            }


            const text =
                messageInput
                    ? messageInput.value.trim()
                    : "";


            if (!text) {

                return;

            }


            if (
                text.length > 2000
            ) {

                alert(
                    "Messages cannot exceed 2000 characters."
                );


                return;

            }


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


                await addDoc(
                    messagesRef,
                    {

                        senderId:
                            currentUser.uid,

                        text:
                            text,

                        createdAt:
                            serverTimestamp()

                    }
                );


                if (messageInput) {

                    messageInput.value =
                        "";

                }

            }

            catch (error) {

                console.error(
                    "Message sending failed:",
 
