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



// =========================================
// CHAT NAME
// =========================================
// This function runs ONLY on chat.html.
// It does not modify auth.js.
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


    // =====================================
    // GET PUBLIC PROFILE
    // =====================================

    let snapshot;

    try {

        snapshot =
            await getDoc(
                publicUserRef
            );

    }

    catch (error) {

        console.error(
            "Could not read public profile:",
            error
        );


        alert(
            "Could not load your CALCULUS Chat profile. " +
            "Please check your internet connection and try again."
        );


        return null;

    }



    // =====================================
    // CHECK EXISTING CHAT NAME
    // =====================================

    if (
        snapshot.exists()
    ) {

        const data =
            snapshot.data();


        if (
            typeof data.chatName === "string" &&
            data.chatName.trim() !== ""
        ) {

            console.log(
                "Existing Chat Name:",
                data.chatName
            );


            return data.chatName.trim();

        }

    }



    // =====================================
    // ASK FOR CHAT NAME
    // =====================================

    let chatName =
        null;


    while (!chatName) {

        chatName =
            window.prompt(
                "Welcome to CALCULUS Chat!\n\n" +
                "Choose the name that other members " +
                "will see when they search for you.\n\n" +
                "Example: gamer45"
            );


        // =================================
        // CANCEL
        // =================================

        if (
            chatName === null
        ) {

            alert(
                "You need to choose a Chat Name " +
                "before using CALCULUS Chat."
            );


            return null;

        }


        // =================================
        // CLEAN NAME
        // =================================

        chatName =
            chatName.trim();


        // =================================
        // EMPTY NAME
        // =================================

        if (!chatName) {

            alert(
                "Please enter a Chat Name."
            );


            chatName =
                null;


            continue;

        }


        // =================================
        // LENGTH
        // =================================

        if (
            chatName.length > 30
        ) {

            alert(
                "Your Chat Name must be 30 characters or fewer."
            );


            chatName =
                null;


            continue;

        }

    }



    // =====================================
    // SAVE CHAT NAME
    // =====================================

    try {

        await setDoc(
            publicUserRef,
            {

                uid:
                    user.uid,

                chatName:
                    chatName,

                photoURL:
                    user.photoURL || ""

            },

            {
                merge: true
            }
        );


        console.log(
            "Chat Name saved:",
            chatName
        );


        return chatName;

    }

    catch (error) {

        console.error(
            "Could not save Chat Name:",
            error
        );


        alert(
            "Your Chat Name could not be saved. " +
            "Please try again."
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
                    false;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    false;

            }


            // =================================
            // CHAT NAME CHECK
            // =================================

            const chatName =
                await ensureChatName(
                    user
                );


            /*
               If the user cancelled the
               Chat Name popup, don't continue
               with Chat functionality.
            */

            if (!chatName) {

                if (messageInput) {

                    messageInput.disabled =
                        true;

                }


                if (emojiButton) {

                    emojiButton.disabled =
                        true;

                }


                return;

            }


            // =================================
            // INITIAL CONVERSATION MESSAGE
            // =================================

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


            const emojiArray =
                emojis.split(" ");


            const selectedEmoji =
                emojiArray[
                    Math.floor(
                        Math.random() *
                        emojiArray.length
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


                        // =====================
                        // NEVER SHOW YOURSELF
                        // =====================

                        if (
                            user.uid ===
                            currentUser.uid
                        ) {

                            return;

                        }


                        // =====================
                        // USE CHAT NAME
                        // =====================

                        const chatName =
                            (
                                user.chatName ||
                                ""
                            ).trim();


                        /*
                           Ignore old public profiles
                           that don't have a Chat Name yet.
                        */

                        if (!chatName) {

          
