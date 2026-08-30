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
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    serverTimestamp,
    query,
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
    document.getEentById(
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
// CHAT NAME POPUP ELEMENTS
// =========================================

const chatNameOverlay =
    document.getElementById(
        "chatNameOverlay"
    );


const chatNameInput =
    document.getElementById(
        "chatNameInput"
    );


const saveChatName =
    document.getElementById(
        "saveChatName"
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



// =========================================
// SMALL HELPER
// =========================================

function showPlaceholder(
    text
) {

    if (!conversationList) {

        return;

    }


    conversationList.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "div"
        );


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

function setChatEnabled(
    enabled
) {

    if (messageInput) {

        messageInput.disabled =
            !enabled;

    }


    if (emojiButton) {

        emojiButton.disabled =
            !enabled;

    }


    if (chatSearch) {

        chatSearch.disabled =
            !enabled;

    }


    if (messageComposer) {

        const sendButton =
            messageComposer.querySelector(
                ".send-button"
            );


        if (sendButton) {

            sendButton.disabled =
                !enabled;

        }

    }

}



// =========================================
// SHOW CHAT NAME POPUP
// =========================================

function showChatNamePopup() {

    if (!chatNameOverlay) {

        console.error(
            "Chat name overlay not found."
        );

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


    console.log(
        "Chat name popup displayed."
    );

}



// =========================================
// HIDE CHAT NAME POPUP
// =========================================

function hideChatNamePopup() {

    if (!chatNameOverlay) {

        return;

    }


    chatNameOverlay.style.display =
        "none";

}



// =========================================
// GET CHAT NAME
// =========================================

async function getChatProfile(
    user
) {

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


    if (!snapshot.exists()) {

        return null;

    }


    return snapshot.data();

}



// =========================================
// SAVE CHAT NAME
// =========================================

async function saveChatNameToFirestore() {

    if (!currentUser) {

        return;

    }


    if (!chatNameInput) {

        return;

    }


    const chatName =
        chatNameInput.value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if (!chatName) {

        alert(
            "Please enter a Chat name."
        );

        chatNameInput.focus();

        return;

    }


    if (chatName.length < 2) {

        alert(
            "Chat name must contain at least 2 characters."
        );

        chatNameInput.focus();

        return;

    }


    if (chatName.length > 30) {

        alert(
            "Chat name cannot exceed 30 characters."
        );

        return;

    }


    /*
       Prevent extremely unusual whitespace-only
       names and normalize surrounding spaces.
    */

    const cleanedName =
        chatName.replace(
            /\s+/g,
            " "
        ).trim();


    try {

        if (saveChatName) {

            saveChatName.disabled =
                true;

            saveChatName.textContent =
                "Saving...";

        }


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
                    cleanedName,

                photoURL:
                    currentUser.photoURL || "",

                chatNameSet:
                    true,

                chatNameUpdatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }
        );


        console.log(
            "Chat name saved:",
            cleanedName
        );


        chatNameReady =
            true;


        hideChatNamePopup();


        setChatEnabled(
            true
        );


        showPlaceholder(
            "Search for a member to start chatting."
        );


        /*
           If there is already text in the search
           box, perform the search immediately.
        */

        if (
            chatSearch &&
            chatSearch.value.trim()
        ) {

            searchUsers(
                chatSearch.value
            );

        }

    }

    catch (error) {

        console.error(
            "Chat name save failed:",
            error
        );


        alert(
            "Your Chat name could not be saved. Please try again."
        );

    }

    finally {

        if (saveChatName) {

            saveChatName.disabled =
                false;

            saveChatName.textContent =
                "Continue";

        }

    }

}



// =========================================
// INITIALIZE CHAT NAME
// =========================================

async function initializeChatName() {

    if (!currentUser) {

        return;

    }


    console.log(
        "Checking Chat name for UID:",
        currentUser.uid
    );


    try {

        const profile =
            await getChatProfile(
                currentUser
            );


        // =====================================
        // NO PUBLIC PROFILE
        // =====================================

        if (!profile) {

            console.log(
                "No Chat profile found."
            );


            chatNameReady =
                false;


            setChatEnabled(
                false
            );


            showChatNamePopup();

            return;

        }


        /*
           New profiles created by this system
           contain chatNameSet: true.
        */

        if (
            profile.chatNameSet ===
            true
        ) {

            chatNameReady =
                true;


            console.log(
                "Existing Chat name:",
                profile.displayName
            );


            setChatEnabled(
                true
            );


            return;

        }


        /*
           Compatibility with an older profile.

           Previously your system may have saved
           the Google account name directly into
           publicUsers.

           If the stored name is different from
           the current Google name, it is very
           likely a previously chosen Chat name.

           Example:

           Google name:
           Ankit Brahamachary

           Stored Chat name:
           67Top

           Therefore keep 67Top.
        */

        const oldName =
            (
                profile.displayName ||
                ""
            ).trim();


        const googleName =
            (
                currentUser.displayName ||
                ""
            ).trim();


        if (
            oldName &&
            oldName !== googleName
        ) {

            console.log(
                "Migrating existing custom Chat name:",
                oldName
            );


            await setDoc(
                doc(
                    db,
                    "publicUsers",
                    currentUser.uid
                ),

                {

                    uid:
                        currentUser.uid,

                    displayName:
                        oldName,

                    photoURL:
                        currentUser.photoURL || "",

                    chatNameSet:
                        true,

                    chatNameUpdatedAt:
                        serverTimestamp()

                },

                {
                    merge: true
                }
            );


            chatNameReady =
                true;


            setChatEnabled(
                true
            );


            return;

        }


        /*
           If the stored name is merely the
           Google account name, treat it as NOT
           having a Chat name.

           This is what fixes your current
           second-account problem.
        */

        console.log(
            "No custom Chat name found."
        );


        chatNameReady =
            false;


        setChatEnabled(
            false
        );


        showChatNamePopup();

    }

    catch (error) {

        console.error(
            "Chat name initialization failed:",
            error
        );


        setChatEnabled(
            false
        );


        alert(
            "Could not load your Chat profile. Check the browser console."
        );

    }

}



// =========================================
// AUTHENTICATION
// =========================================

watchAuthState(
    async (user) => {

        currentUser =
            user;


        console.log(
            "Chat authentication state:",
            user
                ? "SIGNED IN"
                : "SIGNED OUT"
        );


        // =====================================
        // LOGGED IN
        // =====================================

        if (user) {

            console.log(
                "Chat user authenticated:",
                user.uid
            );


            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "none";

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


            /*
               Chat is temporarily disabled until
               the user has chosen a Chat name.
            */

            setChatEnabled(
                false
            );


            showPlaceholder(
                "Checking your Chat profile..."
            );


            await initializeChatName();

        }


        // =====================================
        // LOGGED OUT
        // =====================================

        else {

            console.log(
                "Chat user is signed out."
            );


            chatNameReady =
                false;


            selectedUser =
                null;


            currentConversationId =
                null;


            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages =
                    null;

            }


            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "block";

            }


            setChatEnabled(
                false
            );


            if (chatNameOverlay) {

                chatNameOverlay.style.display =
                    "none";

            }


            showPlaceholder(
                "Please sign in to use Chat."
            );


            if (messagesArea) {

                messagesArea.innerHTML =
                    "";


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
                    "Sign in to Chat";


                const paragraph =
                    document.createElement(
                        "p"
                    );


                paragraph.textContent =
                    "Sign in and choose your Chat name to begin.";


                empty.appendChild(
                    heading
                );


                empty.appendChild(
                    paragraph
                );


                messagesArea.appendChild(
                    empty
                );

            }

        }

    }
);



// =========================================
// CHAT NAME BUTTON
// =========================================

if (saveChatName) {

    saveChatName.addEventListener(
        "click",
        saveChatNameToFirestore
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

                saveChatNameToFirestore();

            }

        }
    );

}



// =========================================
// FIND / CREATE CONVERSATION
// =========================================

async function getOrCreateConversation(
    otherUser
) {

    if (
        !currentUser ||
        !otherUser
    ) {

        return null;

    }


    const participantIds = [

        currentUser.uid,
        otherUser.uid

    ].sort();


    const conversationId =
        participantIds.join(
            "_"
        );


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

async function selectUser(
    user
) {

    if (
        !currentUser ||
        !chatNameReady
    ) {

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


    if (chatUserPlaceholder) {

        chatUserPlaceholder.textContent =
            user.displayName ||
            "CALCULUS User";

    }


    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    if (messagesArea) {

        messagesArea.innerHTML =
            "";


        const loading =
            document.createElement(
                "div"
            );


        loading.className =
            "messages-empty";


        const heading =
            document.createElement(
                "h2"
            );


        heading.textContent =
            "Loading conversation...";


        loading.appendChild(
            heading
        );


        messagesArea.appendChild(
            loading
        );

    }


    try {

        currentConversationId =
            await getOrCreateConversation(
                user
            );


        if (!currentConversationId) {

            return;

        }


        listenForMessages(
            currentConversationId
        );

    }

    catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        if (messagesArea) {

            messagesArea.innerHTML =
                "";


            const errorMessage =
                document.createElement(
                    "div"
                );


            errorMessage.className =
                "messages-empty";


            const heading =
                document.createElement(
                    "h2"
                );


            heading.textContent =
                "Could not open conversation";


            errorMessage.appendChild(
                heading
            );


            messagesArea.appendChild(
                errorMessage
            );

        }

    }

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


    console.log(
        "Listening for messages:",
        conversationId
    );


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

                console.log(
                    "Messages received:",
                    snapshot.size
                );


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

                        message.dataset.messageId =
    messageDoc.id;

message.dataset.senderId =
    data.senderId;


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
                           HTML injection.
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

                alert(
                    "Please sign in first."
                );

                return;

            }


            if (!chatNameReady) {

                alert(
                    "Choose your Chat name first."
                );

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

                    messageInput.focus();

                }


                console.log(
                    "Message sent."
                );

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

            if (
                !messageInput ||
                !chatNameReady
            ) {

                return;

            }


            const emojis =
                "😀 😂 😍 😎 🤔 😄 👍 ❤️ 🎉 🔥 😭 🙌";


            const emojiArray =
                emojis.split(
                    " "
                );


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
// SEARCH USERS
// =========================================

async function searchUsers(
    value
) {

    if (
        !currentUser ||
        !chatNameReady
    ) {

        return;

    }


    const searchText =
        value
            .trim()
            .toLowerCase();


    if (!searchText) {

        showPlaceholder(
            "Search for a member to start chatting."
        );

        return;

    }


    if (!conversationList) {

        return;

    }


    showPlaceholder(
        "Searching..."
    );


    try {

        console.log(
            "Searching publicUsers for:",
            searchText
        );


        const publicUsersRef =
            collection(
                db,
                "publicUsers"
            );


        const snapshot =
            await getDocs(
                publicUsersRef
            );


        console.log(
            "Public users found:",
            snapshot.size
        );


        conversationList.innerHTML =
            "";


        let found =
            false;


        snapshot.forEach(
            (userDoc) => {

                const user =
                    userDoc.data();


                /*
                   Never show yourself.
                */

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
                    ).trim();


                const lowerName =
                    displayName.toLowerCase();


                if (
                    !lowerName.includes(
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
                    displayName ||
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



// =========================================
// SEARCH INPUT
// =========================================

if (chatSearch) {

    chatSearch.addEventListener(
        "input",

        () => {

            searchUsers(
                chatSearch.value
            );

        }
    );

}
window.calculusChat =
    {
        getConversationId:
            () => currentConversationId
    };
