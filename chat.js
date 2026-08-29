// =========================================
// CALCULUS — CHAT PAGE
// =========================================
// One-to-one text chat
// Firebase Authentication + Firestore
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



// =========================================
// STATE
// =========================================

let currentUser = null;

let selectedUser = null;

let currentConversationId = null;

let unsubscribeMessages = null;



// =========================================
// AUTHENTICATION
// =========================================

watchAuthState(
    async (user) => {

        currentUser = user;


        // =====================================
        // LOGGED IN
        // =====================================

        if (user) {

            if (chatLoginNotice) {
                chatLoginNotice.style.display =
                    "none";
            }


            if (messageInput) {
                messageInput.disabled = false;
            }


            if (emojiButton) {
                emojiButton.disabled = false;
            }


            if (chatSearch) {
                chatSearch.disabled = false;
            }


            if (conversationList) {

                conversationList.innerHTML = "";

                const placeholder =
                    document.createElement("div");

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

            if (chatLoginNotice) {
                chatLoginNotice.style.display =
                    "block";
            }


            if (messageInput) {
                messageInput.disabled = true;
            }


            if (emojiButton) {
                emojiButton.disabled = true;
            }


            if (chatSearch) {
                chatSearch.disabled = true;
            }


            if (conversationList) {

                conversationList.innerHTML = "";

                const placeholder =
                    document.createElement("div");

                placeholder.className =
                    "conversation-placeholder";

                placeholder.textContent =
                    "Please sign in to use Chat.";

                conversationList.appendChild(
                    placeholder
                );
            }


            selectedUser = null;

            currentConversationId = null;


            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages = null;
            }

        }

    }
);



// =========================================
// FIND / CREATE CONVERSATION
// =========================================

async function getOrCreateConversation(otherUser) {

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


    selectedUser = user;


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

        unsubscribeMessages = null;
    }


    // =====================================
    // CLEAR OLD MESSAGES
    // =====================================

    if (messagesArea) {

        messagesArea.innerHTML = "";

        const loading =
            document.createElement("div");

        loading.className =
            "messages-empty";

        const heading =
            document.createElement("h2");

        heading.textContent =
            "Loading messages...";

        loading.appendChild(heading);

        messagesArea.appendChild(loading);
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
            "Conversation creation failed:",
            error
        );

        if (messagesArea) {

            messagesArea.innerHTML = "";

            const errorMessage =
                document.createElement("div");

            errorMessage.className =
                "messages-empty";

            errorMessage.textContent =
                "Unable to open this conversation.";

            messagesArea.appendChild(
                errorMessage
            );
        }

        return;
    }


    if (!currentConversationId) {
        return;
    }


    // =====================================
    // START REAL-TIME LISTENER
    // =====================================

    listenForMessages(
        currentConversationId
    );
}



// =========================================
// RECEIVE MESSAGES IN REAL TIME
// =========================================

function listenForMessages(conversationId) {

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


    /*
       onSnapshot keeps this listener alive.

       Whenever the other user sends a new
       message, Firestore sends a new snapshot
       to this computer automatically.
    */

    unsubscribeMessages =
        onSnapshot(

            messagesQuery,

            (snapshot) => {

                messagesArea.innerHTML = "";


                if (snapshot.empty) {

                    const empty =
                        document.createElement("div");

                    empty.className =
                        "messages-empty";


                    const heading =
                        document.createElement("h2");

                    heading.textContent =
                        "Start the conversation";


                    const paragraph =
                        document.createElement("p");

                    paragraph.textContent =
                        "Send the first message.";


                    empty.appendChild(heading);

                    empty.appendChild(paragraph);

                    messagesArea.appendChild(empty);

                    return;
                }


                snapshot.forEach(
                    (messageDoc) => {

                        const data =
                            messageDoc.data();


                        const message =
                            document.createElement("div");


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
                           Never use innerHTML for
                           user-written messages.
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
                    "REAL-TIME MESSAGE LISTENER ERROR:",
                    error
                );


                if (messagesArea) {

                    messagesArea.innerHTML = "";


                    const errorBox =
                        document.createElement("div");

                    errorBox.className =
                        "messages-empty";


                    const heading =
                        document.createElement("h2");

                    heading.textContent =
                        "Unable to receive messages";


                    const paragraph =
                        document.createElement("p");

                    paragraph.textContent =
                        "Firestore permission denied or the conversation is unavailable.";


                    errorBox.appendChild(heading);

                    errorBox.appendChild(paragraph);

                    messagesArea.appendChild(
                        errorBox
                    );
                }
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


            const emojiList =
                emojis.split(" ");


            const selectedEmoji =
                emojiList[
                    Math.floor(
                        Math.random() *
                        emojiList.length
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

                if (conversationList) {

                    conversationList.innerHTML = "";

                    const placeholder =
                        document.createElement("div");

                    placeholder.className =
                        "conversation-placeholder";

                    placeholder.textContent =
                        "Search for a member to start chatting.";

                    conversationList.appendChild(
                        placeholder
                    );
                }

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


                conversationList.innerHTML = "";


                let found = false;


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


                        found = true;


                        const button =
                            document.createElement("button");


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

                    const empty =
                        document.createElement("div");

                    empty.className =
                        "conversation-placeholder";

                    empty.textContent =
                        "No members found.";

                    conversationList.appendChild(
                        empty
                    );
                }

            }

            catch (error) {

                console.error(
                    "User search failed:",
                    error
                );

            }

        }
    );
                    }
