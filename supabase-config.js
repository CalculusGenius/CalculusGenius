// =========================================
// CALCULUS — SUPABASE CONFIGURATION
// =========================================

import { createClient } from
    "https://esm.sh/@supabase/supabase-js@2";

import {
    getAuth
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    app
} from "./firebase-config.js";


// =========================================
// SUPABASE PROJECT
// =========================================

const supabaseUrl =
    "https://auutipwsbqmpvifzzrwq.supabase.co";

const supabasePublishableKey =
    "sb_publishable_9TCU5KyPVqGrjpNBFXbR2g_Oy0Pna2Y";


// =========================================
// FIREBASE AUTH
// =========================================

const firebaseAuth =
    getAuth(app);


// =========================================
// SUPABASE CLIENT
// =========================================

export const supabase =
    createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            accessToken: async () => {

                const user =
                    firebaseAuth.currentUser;

                if (!user) {

                    return null;

                }

                return await user.getIdToken(
                    false
                );

            }
        }
    );
