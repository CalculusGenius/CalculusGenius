// =========================================
// CALCULUS — CHAT PAGE
// + PUBLIC USER DIRECTORY
// =========================================


import {
    watchAuthState
} from "./auth.js";


import {
    getFirestore,
    collection,
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


const chatSearch =
    document.getElementById(
        "chatSearch"
    );



// =========================================
// STATE
// =========================================

let currentUser = null;

let allPublicUsers = [];

let unsubscribeUsers = null;



// =========================================
// DISPLAY USERS
// =========================================

function displayUsers(
    users
) {

    if (!conversationList) {

        return;

    }


    /*
       Clear the existing
       placeholder/list.
    */

    conversationList.innerHTML = "";


    /*
       No other users found.
    */

    if (users.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "conversation-placeholder";

        empty.textContent =
            "No other members found.";

        conversationList.appendChild(
            empty
        );

        return;

    }


    /*
       Create one entry
       for every public user.
    */

    users.forEach(
        (user) => {

            const userElement =
                document.createElement("button");


            userElement.type =
                "button";


            userElement.className =
                "chat-user";


            userElement.dataset.uid =
                user.uid;


            // =================================
            // PROFILE IMAGE
            // =================================

            const image =
                document.createElement("img");


            image.className =
                "chat-user-image";


            image.src =
                user.photoURL ||
                "logo.png";


            image.alt =
                user.displayName ||
                "CALCULUS User";


            image.onerror =
                () => {

                    image.src =
                        "logo.png";

                };


            // =================================
            // USER NAME
            // =================================

            const name =
                document.createElement("span");


            name.className =
                "chat-user-name";


            name.textContent =
                user.displayName ||
                "CALCULUS User";


            // =================================
            // BUILD USER ITEM
            // =================================

            userElement.appendChild(
                image
            );


            userElement.appendChild(
                name
            );


            conversationList.appendChild(
                userElement
            );

        }
    );

}



// =========================================
// LOAD PUBLIC USERS
// =========================================

function startPublicUserListener() {

    /*
       Stop an old listener first.
    */

    if (unsubscribeUsers) {

        unsubscribeUsers();

        unsubscribeUsers = null;

    }


    /*
       Reference:

       publicUsers/{UID}
    */

    const publicUsersRef =
        collection(
            db,
            "publicUsers"
        );


    /*
       Listen for changes in real time.

       This means that when another member
       creates their public profile, the
       directory can update automatically.
    */

    unsubscribeUsers =
        onSnapshot(
            publicUsersRef,

            (snapshot) => {

                allPublicUsers = [];


                snapshot.forEach(
                    (document) => {

                        const data =
                            document.data();


                        /*
                           Never display the
                           currently logged-in
                           user as another user.
                        */

                        if (
                            currentUser &&
                            document.id ===
                            currentUser.uid
                        ) {

                            return;

                        }


                        allPublicUsers.push(
                            {

                                uid:
                                    document.id,

                                displayName:
                                    data.displayName ||
                                    "CALCULUS User",

                                photoURL:
                                    data.photoURL ||
                                    ""

                            }
                        );

                    }
                );


                /*
                   Sort alphabetically.
                */

                allPublicUsers.sort(
                    (a, b) => {

                        return a.displayName
                            .localeCompare(
                                b.displayName
                            );

                    }
                );


                displayUsers(
                    allPublicUsers
                );

            },

            (error) => {

                console.error(
                    "Could not load public users:",
                    error
                );


                if (
                    conversationList
                ) {

                    conversationList.innerHTML =
                        "";


                    const errorElement =
                        document.createElement(
                            "div"
                        );


                    errorElement.className =
                        "conversation-placeholder";


                    errorElement.textContent =
                        "Unable to load members right now.";


                    conversationList.appendChild(
                        errorElement
                    );

                }

            }
        );

}



// =========================================
// SEARCH USERS
// =========================================

if (chatSearch) {

    chatSearch.addEventListener(
        "input",
        () => {

            const search =
                chatSearch.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                displayUsers(
                    allPublicUsers
                );

                return;

            }


            const filteredUsers =
                allPublicUsers.filter(
                    (user) => {

                        return user.displayName
                            .toLowerCase()
                            .includes(search);

                    }
                );


            displayUsers(
                filteredUsers
            );

        }
    );

}



// =========================================
// USER SELECTION
// =========================================

if (conversationList) {

    conversationList.addEventListener(
        "click",
        (event) => {

            const userButton =
                event.target.closest(
                    ".chat-user"
                );


            if (!userButton) {

                return;

            }


            const uid =
                userButton.dataset.uid;


            const selectedUser =
                allPublicUsers.find(
                    (user) =>
                        user.uid === uid
                );


            if (!selectedUser) {

                return;

            }


            /*
               For now we only select
               the user.

               Actual conversation loading
               comes in the next stage.
            */

            console.log(
                "Selected user:",
                selectedUser
            );


            /*
               Highlight selected user.
            */

            document
                .querySelectorAll(
                    ".chat-user"
                )
                .forEach(
                    (element) => {

                        element.classList.remove(
                            "selected"
                        );

                    }
                );


            userButton.classList.add(
                "selected"
            );


            /*
               Update chat header.
            */

            const chatUserPlaceholder =
                document.getElementById(
                    "chatUserPlaceholder"
                );


            if (chatUserPlaceholder) {

                chatUserPlaceholder.textContent =
                    selectedUser.displayName;

            }

        }
    );

}



// =========================================
// AUTHENTICATION STATE
// =========================================

watchAuthState(
    (user) => {

        currentUser =
            user;


        // =====================================
        // LOGGED IN
        // =====================================

        if (user) {

            /*
               Hide login notice.
            */

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "none";

            }


            /*
               Enable composer.
            */

            if (messageInput) {

                messageInput.disabled =
                    false;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    false;

            }


            /*
               Load public users.
            */

            startPublicUserListener();

        }


        // =====================================
        // LOGGED OUT
        // =====================================

        else {

            /*
               Show login notice.
            */

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "block";

            }


            /*
               Disable composer.
            */

            if (messageInput) {

                messageInput.disabled =
                    true;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    true;

            }


            /*
               Stop Firestore listener.
            */

            if (unsubscribeUsers) {

                unsubscribeUsers();

                unsubscribeUsers =
                    null;

            }


            /*
               Clear user directory.
            */

            allPublicUsers = [];


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
                    "Sign in to see other members.";


                conversationList.appendChild(
                    placeholder
                );

            }

        }

    }
);



// =========================================
// MESSAGE COMPOSER
// =========================================

if (messageComposer) {

    messageComposer.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /*
               Don't allow sending while
               logged out.
            */

            if (!currentUser) {

                return;

            }


            const message =
                messageInput
                    ? messageInput.value.trim()
                    : "";


            if (!message) {

                return;

            }


            /*
               Actual Firestore message
               storage will be added next.
            */

            console.log(
                "Message ready:",
                message
            );


            if (messageInput) {

                messageInput.value =
                    "";

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

            if (!currentUser) {

                return;

            }


            /*
               Emoji picker will be
               implemented later.
            */

            console.log(
                "Emoji button clicked."
            );

        }
    );

        }
