// =========================================
// CALCULUS — CHAT PAGE
// =========================================
// One-to-one text chat
// Firebase Authentication + Firestore
// Custom Chat Names
// =========================================


import {
    watchAuthState
} from "./auth.js";


import {
    getFirestore,
    collection,
    query,
    doc,
    getDoc,
    setDoc,
    addDoc,
    serverTimestamp,
    orderBy,
    onSnapshot,
    getDocs
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
    document.getElementById("chatLoginNotice");

const messageComposer =
    document.getElementById("messageComposer");

const messageInput =
    document.getElementById("messageInput");

const emojiButton =
    document.getElementById("emojiButton");

const conversationList =
    document.getElementById("conversationList");

const messagesArea =
    document.getElementById("messagesArea");

const chatUserPlaceholder =
    document.getElementById("chatUserPlaceholder");

const chatSearch =
    document.getElementById("chatSearch");


// NAME POPUP

const chatNameOverlay =
    document.getElementById("chatNameOverlay");

const chatNameInput =
    document.getElementById("chatNameInput");

const saveChatName =
    document.getElementById("saveChatName");



// =========================================
// STATE
// =========================================

let currentUser =
    null;

let currentChatName =
    "";

let selectedUser =
    null;

let currentConversationId =
    null;

let unsubscribeMessages =
    null;



// =========================================
// HELPER — PLACEHOLDER
// =========================================

function showPlaceholder(text) {

    if (!conversationList) {
        return;
    }

    conversationList.innerHTML = "";

    const placeholder =
        document.createElement("div");

    placeholder.className =
        "conversation-placeholder";

    placeholder.textContent =
        text;

    conversationList.appendChild(
        placeholder
    );
}



// =========================================
// ENABLE / DISABLE CHAT
// =========================================

function setChatEnabled(enabled) {

    if (messageInput) {

        messageInput.disabled =
            !enabled;

    }

    if (emojiButton) {

        emojiButton.disabled =
            !enabled;

    }

}



// =========================================
// LOAD CHAT NAME
// =========================================

async function loadChatName(user) {

    try {

        const publicUserRef =
            doc(
                db,
                "publicUsers",
                user.uid
            );


        const snapshot =
            await getDoc(
                publicUserRef
            );


        // =====================================
        // EXISTING CHAT NAME
        // =====================================

        if (
            snapshot.exists() &&
            snapshot.data().displayName
        ) {

            currentChatName =
                snapshot.data().displayName;

            return true;

        }


        // =====================================
        // NO CHAT NAME YET
        // =====================================

        currentChatName =
            "";

        return false;

    }

    catch (error) {

        console.error(
            "Could not load Chat name:",
            error
        );

        return false;

    }

}



// =========================================
// SHOW NAME POPUP
// =========================================

function showNamePopup() {

    if (!chatNameOverlay) {
        return;
    }


    chatNameOverlay.style.display =
        "flex";


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
// HIDE NAME POPUP
// =========================================

function hideNamePopup() {

    if (!chatNameOverlay) {
        return;
    }


    chatNameOverlay.style.display =
        "none";

}



// =========================================
// SAVE CHAT NAME
// =========================================

async function saveUserChatName() {

    if (!currentUser) {
        return;
    }


    if (!chatNameInput) {
        return;
    }


    const name =
        chatNameInput.value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if (!name) {

        alert(
            "Please enter a Chat name."
        );

        chatNameInput.focus();

        return;

    }


    if (name.length < 2) {

        alert(
            "Your Chat name must contain at least 2 characters."
        );

        chatNameInput.focus();

        return;

    }


    if (name.length > 30) {

        alert(
            "Your Chat name cannot exceed 30 characters."
        );

        return;

    }


    if (!currentUser) {
        return;
    }


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

                displayName:
                    name,

                photoURL:
                    currentUser.photoURL || ""

            },

            {
                merge: true
            }
        );


        currentChatName =
            name;


        hideNamePopup();


        showPlaceholder(
            "Search for a member to start chatting."
        );


        console.log(
            "Chat name saved:",
            name
        );

    }

    catch (error) {

        console.error(
            "Could not save Chat name:",
            error
        );


        alert(
            "Your Chat name could not be saved. Please try again."
        );

    }

}



// =========================================
// NAME POPUP BUTTON
// =========================================

if (saveChatName) {

    saveChatName.addEventListener(
        "click",
        saveUserChatName
    );

}



// =========================================
// ENTER KEY IN NAME BOX
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

                saveUserChatName();

            }

        }
    );

}



// =========================================
// AUTHENTICATION STATE
// =========================================

watchAuthState(
    async (user) => {

        currentUser =
            user;


        // =====================================
        // LOGGED IN
        // =====================================

        if (user) {

            console.log(
                "Chat user authenticated:",
                user.uid
            );


            // Hide login notice

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "none";

            }


            // Enable chat controls

            setChatEnabled(
                true
            );


            // =================================
            // LOAD CUSTOM CHAT NAME
            // =================================

            const hasChatName =
                await loadChatName(
                    user
                );


            // =================================
            // SHOW POPUP IF NECESSARY
            // =================================

            if (!hasChatName) {

                showNamePopup();

            }


            // =================================
            // INITIAL CHAT STATE
            // =================================

            showPlaceholder(
                "Search for a member to start chatting."
            );

        }


        // =====================================
        // LOGGED OUT
        // =====================================

        else {

            console.log(
                "No authenticated Chat user."
            );


            // Show login notice

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "block";

            }


            // Disable chat

            setChatEnabled(
                false
            );


            // Hide name popup

            hideNamePopup();


            currentChatName =
                "";

            selectedUser =
                null;

            currentConversationId =
                null;


            // Stop old message listener

            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages =
                    null;

            }


            showPlaceholder(
                "Please sign in to use Chat."
            );

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


    if (
        user.uid ===
        currentUser.uid
    ) {

        return;

    }


    selectedUser =
        user;


    // =====================================
    // UPDATE HEADER
    // =====================================

    if (chatUserPlaceholder) {

        chatUserPlaceholder.textContent =
            user.displayName ||
            "CALCULUS User";

    }


    // =====================================
    // STOP OLD LISTENER
    // =====================================

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    // =====================================
    // GET CONVERSATION
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

        alert(
            "Could not open this conversation."
        );

        return;

    }


    if (!currentConversationId) {
        return;
    }


    // =====================================
    // LISTEN FOR MESSAGES
    // =====================================

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


            if (text.length > 2000) {

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
                    error
                );


                alert(
                    "Message could not be sent. Please try again."
                );

            }

        }

    );

}



// =========================================
// EMOJI BUTTON
// =========================================

if (emojiButton) {

    emojiButton.addEventListener(
        "click",

        () => {

            if (!messageInput) {
                return;
            }


            const emojis =
                "😀 😂 😍 😎 🤔 😄 👍 ❤️ 🎉 🔥 😭 🙌";


            const list =
                emojis.split(" ");


            const selectedEmoji =
                list[
                    Math.floor(
                        Math.random() *
                        list.length
                    )
                ];


            messageInput.value +=
                selectedEmoji;


            messageInput.focus();

        }

    );

}


// =========================================
// SEARCH PUBLIC USERS
// =========================================

if (chatSearch) {

    chatSearch.addEventListener(
        "input",

        async () => {

            if (!currentUser) {
                return;
            }


            const searchText =
                chatSearch.value
                    .trim()
                    .toLowerCase();


            if (!searchText) {

                showPlaceholder(
                    "Search for a member to start chatting."
                );

                return;

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


                if (!conversationList) {
                    return;
                }


                conversationList.innerHTML =
                    "";


                let found =
                    false;


                snapshot.forEach(
                    (userDoc) => {

                        const user =
                            userDoc.data();


                        // Never show yourself

                        if (
                            userDoc.id ===
                            currentUser.uid
                        ) {

                            return;

                        }


                        const displayName =
                            (
                                user.displayName ||
                                ""
                            ).toLowerCase();


                        if (
                            !displayName.includes(
                                searchText
                            )
                        ) {

                            return;

                        }


                        found =
                            true;


                        const button =
                            document.createElement(
                                "button"
                            );


                        button.type =
                            "button";


                        button.className =
                            "conversation-user";


                        button.textContent =
                            user.displayName ||
                            "CALCULUS User";


                        button.addEventListener(
                            "click",
                            () => {

                                selectUser(
                                    user
                                );

                            }
                        );


                        conversationList.appendChild(
                            button
                        );

                    }
                );


                if (!found) {

                    showPlaceholder(
                        "No members found."
                    );

                }

            }

            catch (error) {

                console.error(
                    "User search failed:",
                    error
                );


                showPlaceholder(
                    "Could not search members."
                );

            }

        }

    );

}      
