// =========================================
// CALCULUS — SUPABASE CONFIGURATION
// =========================================

import { createClient } from
    "https://esm.sh/@supabase/supabase-js@2";


// =========================================
// SUPABASE PROJECT
// =========================================

const supabaseUrl =
    "YOUR_SUPABASE_API_URL";

const supabasePublishableKey =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


// =========================================
// SUPABASE CLIENT
// =========================================

export const supabase =
    createClient(
        supabaseUrl,
        supabasePublishableKey
    );
