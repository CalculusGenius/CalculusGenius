// =========================================
// CALCULUS — SUPABASE CONFIGURATION
// =========================================

import { createClient } from
    "https://esm.sh/@supabase/supabase-js@2";


// =========================================
// SUPABASE PROJECT
// =========================================

const supabaseUrl =
    "https://auutipwsbqmpvifzzrwq.supabase.co/rest/v1/";

const supabasePublishableKey =
    "sb_publishable_9TCU5KyPVqGrjpNBFXbR2g_Oy0Pna2Y";


// =========================================
// SUPABASE CLIENT
// =========================================

export const supabase =
    createClient(
        supabaseUrl,
        supabasePublishableKey
    );
