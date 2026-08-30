// =========================================
// CALCULUS — SUPABASE CONFIGURATION
// =========================================
// Supabase Storage + Firebase Authentication
// =========================================

import { createClient } from
    "https://esm.sh/@supabase/supabase-js@2";

import { auth } from "./auth.js";


// =========================================
// SUPABASE PROJECT
// =========================================

const supabaseUrl =
    "https://auutipwsbqmpvifzzrwq.supabase.co";

const supabasePublishableKey =
    "sb_publishable_9TCU5KyPVqGrjpNBFXbR2g_Oy0Pna2Y";


// =========================================
// SUPABASE CLIENT
// =========================================
// Firebase Auth supplies the user JWT.
// Supabase Third-Party Auth validates it.
// =========================================

export const supabase =
    createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            accessToken: async () => {

                if (!auth.currentUser) {

                    return null;

                }

                return await auth.currentUser
                    .getIdToken(false);

            }
        }
    );
