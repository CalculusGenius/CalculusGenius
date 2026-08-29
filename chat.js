// =========================================
// CALCULUS — CHAT PAGE
// =========================================
// One-to-one text chat
// Firebase Authentication + Firestore
// Custom CALCULUS Chat Name
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


// Chat Name modal

const chatNameModal =
    document.getElementById("chatNameModal");

const chatNameInput =
    document.getElementById("chatNameInput");

const chatNameError =
    document.getElementById("chatNameError");

const saveChatNameButton =
    document.getElementById("saveChatNameButton");



// =========================================
// STATE
// =========================================

let currentUser =
    null;

let currentChatName =
    null;

let selectedUser =
    null;

let currentConversationId =
    null;

let unsubscribeMessages =
    null;

let allPublicUsers =
    [];



// =========================================
// SHOW CHAT NAME MODAL
// =========================================

function showChatNameModal() {

    if (!chatNameModal) {

        console.error(
            "chatNameModal not found."
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
// GET / CREATE CHAT PROFILE
// =========================================

async function prepareChatProfile(
    user
) {

    const userRef =
        doc(
            db,
            "publicUsers",
            user.uid
        );


    let snapshot;

    try {

        snapshot =
            await getDoc(
                userRef
            );

    }

    catch (error) {

        console.error(
            "Could not read public user profile:",
            error
        );


        return null;

    }


    // =====================================
    // EXISTING CHAT NAME
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

            currentChatName =
                data.chatName.trim();


            return currentChatName;

        }

    }


    // =====================================
    // NO CHAT NAME
    // =====================================

    showChatNameModal();

    return new Promise(
        (resolve) => {

            window.calculusChatNameResolve =
                resolve;

        }
    );

}



// =========================================
// SAVE CHAT NAME
// =========================================

async function saveChatName() {

    if (!currentUser) {

        return;

    }


    let chatName =
        chatNameInput
            ? chatNameInput.value.trim()
            : "";


    // =====================================
    // VALIDATION
    // =====================================

    if (!chatName) {

        if (chatNameError) {

            chatNameError.textContent =
                "Please enter a Chat Name.";

        }

        return;

    }


    if (
        chatName.length > 30
    ) {

        if (chatNameError) {

            chatNameError.textContent =
                "Chat Name must be 30 characters or fewer.";

        }

        return;

    }


    saveChatNameButton.disabled =
        true;


    saveChatNameButton.textContent =
        "Saving...";


    try {

        const userRef =
            doc(
                db,
                "publicUsers",
                currentUser.uid
            );


        await setDoc(
            userRef,
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


        currentChatName =
            chatName;


        hideChatNameModal();


        /*
           Resolve the promise created by
           prepareChatProfile().
        */

        if (
            typeof window.calculusChatNameResolve ===
            "function"
        ) {

            window.calculusChatNameResolve(
                chatName
            );

            window.calculusChatNameResolve =
                null;

        }


        console.log(
            "Chat Name saved:",
            chatName
        );


    }

    catch (error) {

        console.error(
            "Chat Name could not be saved:",
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



// =========================================
// SAVE BUTTON
// =========================================

if (saveChatNameButton) {

    saveChatNameButton.addEventListener(
        "click",
        saveChatName
    );

}



// =========================================
// ENTER KEY
// =========================================

if (chatNameInput) {

    chatNameInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                saveChatName();

            }

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


        // =====================================
        // LOGGED OUT
        // =====================================

        if (!user) {

            currentChatName =
                null;

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


            if (messageInput) {

                messageInput.disabled =
                    true;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    true;

            }


            if (chatSearch) {

                chatSearch.disabled =
                    true;

            }


            return;

        }



        // =====================================
        // LOGGED IN
        // =====================================

        /*
           Hide the login notice FIRST.

           The Chat Name check must never
           make the login notice appear for
           an authenticated user.
        */

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


        if (chatSearch) {

            chatSearch.disabled =
                true;

        }


        // =====================================
        // CHAT NAME
        // =====================================

        const chatName =
            await prepareChatProfile(
                user
            );


        if (!chatName) {

            return;

        }


        currentChatName =
            chatName;


        // =====================================
        // CHAT READY
        // =====================================

        if (messageInput) {

            messageInput.disabled =
                false;

        }


        if (emojiButton) {

            emojiButton.disabled =
                false;

        }


        if (chatSearch) {

            chatSearch.disabled =
                false;

        }


        showSearchPlaceholder();

    }
);



// =========================================
// SEARCH PLACEHOLDER
// =========================================

function showSearchPlaceholder() {

    if (!conversationList) {

        return;

    }


    conversationList.innerHTML =
        "";


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



// =========================================
// LOAD PUBLIC USERS
// =========================================

async function loadPublicUsers() {

    if (!currentUser) {

        return;

    }


    try {

        const usersRef =
            collection(
                db,
                "publicUsers"
            );


        const snapshot =
            await getDocs(
                usersRef
            );


        allPublicUsers =
            [];


        snapshot.forEach(
            (userDoc) => {

                const data =
                    userDoc.data();


                /*
                   Never include yourself.
                */

                if (
                    userDoc.id ===
                    currentUser.uid
                ) {

                    return;

                }


                /*
                   ONLY chatName is used.

                   Google displayName is
                   deliberately ignored.
                */

                if (
                    typeof data.chatName !== "string" ||
                    data.chatName.trim() === ""
                ) {

                    return;

                }


                allPublicUsers.push(
                    {

                        uid:
                            userDoc.id,

                        chatName:
                            data.chatName.trim(),

                        photoURL:
                            data.photoURL || ""

                    }
                );

            }
        );


        allPublicUsers.sort(
            (a, b) =>
                a.chatName.localeCompare(
                    b.chatName
                )
        );


        return allPublicUsers;

    }

    catch (error) {

        console.error(
            "Could not load public users:",
            error
        );


        return [];

    }

}



// =========================================
// DISPLAY SEARCH RESULTS
// =========================================

function displaySearchResults(
    users
) {

    if (!conversationList) {

        return;

    }


    conversationList.innerHTML =
        "";


    if (
        users.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "conversation-placeholder";


        empty.textContent =
            "No members found.";


        conversationList.appendChild(
            empty
        );


        return;

    }


    users.forEach(
        (user) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "conversation-user";


            button.dataset.uid =
                user.uid;


            /*
               User name.
            */

            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "conversation-user-name";


            name.textContent =
                user.chatName;


            /*
               Profile image.
            */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "conversation-user-image";


            image.src =
                user.photoURL ||
                "logo.png";


            image.alt =
                user.chatName;


            image.onerror =
                () => {

                    image.src =
                        "logo.png";

                };


            button.appendChild(
                image
            );


            button.appendChild(
                name
            );


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

}



// =========================================
// SEARCH USERS
// =========================================

if (chatSearch) {

    chatSearch.addEventListener(
        "input",

        async () => {

            if (!currentUser) {

                return;

            }


            if (!currentChatName) {

                return;

            }


            const search =
                chatSearch.value
                    .trim()
                    .toLowerCase();


            const users =
                await loadPublicUsers();


            if (!search) {

                showSearchPlaceholder();

                return;

            }


            const results =
                users.filter(
                    (user) =>
                        user.chatName
                            .toLowerCase()
                            .includes(search)
                );


            displaySearchResults(
                results
            );

        }
    );

}



// =========================================
// CREATE / GET CONVERSATION
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

async function selectUser(
    user
) {

    if (!currentUser) {

        return;

    }


    selectedUser =
        user;


    if (chatUserPlaceholder) {

        chatUserPlaceholder.textContent =
            user.chatName;

    }


    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    try {

        currentConversationId =
            await getOrCreateConversation(
                user
            );


        listenForMessages(
            currentConversationId
        );

    }

    catch (error) {

        console.error(
            "Could not open conversation:",
            error
        );

    }

}



// =========================================
// RECEIVE MESSAGES IN REAL TIME
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


          
