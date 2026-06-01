# Task Tracker: Project KOMAH Backend Integration

## Fase 1: Setup Foundation
- [x] Install dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `leaflet`, `react-leaflet`, `jspdf`, `jspdf-autotable`)
- [x] Create `.env.local` with Supabase placeholder values
- [x] Create `lib/supabase/client.js` (browser client)
- [x] Create `lib/supabase/server.js` (server client)
- [x] Create `lib/constants.js` (tarif, koordinat, endpoints)

## Fase 2: Authentication System
- [x] Create `middleware.js` (route protection + role-based redirect)
- [x] Modify `login/page.jsx` (Supabase signIn)
- [x] Modify `register/pengguna/page.jsx` (Supabase signUp customer)
- [x] Modify `register/driver/page.jsx` (add vehicle fields + Supabase signUp driver)

## Fase 3: Profile Integration
- [x] Create `lib/hooks/useProfile.js`
- [x] Modify `user/layout.js` (real profile data + logout)
- [x] Modify `driver/layout.js` (real profile data + logout)
- [x] Modify `user/profile/page.jsx` (Supabase CRUD)
- [x] Modify `driver/profile/page.jsx` (Supabase CRUD)

## Fase 4: Order System + Maps + Distance
- [x] Create `components/MapPicker.jsx` (Leaflet map component)
- [x] Create `lib/osrm.js` (distance calculation)
- [x] Create `lib/pricing.js` (price calculation)
- [x] Modify `user/ride/page.jsx` (map + real order insert)
- [x] Modify `user/delivery/page.jsx` (map + real order insert)
- [x] Modify `user/food/page.jsx` (map + real order insert)
- [x] Modify `user/helper/page.jsx` (map + real order insert)
- [x] Modify `user/page.jsx` (real active order query)

## Fase 5: Driver Dashboard + Take Order
- [x] Modify `driver/page.jsx` (real stats + active order)
- [x] Modify `driver/pesanan/page.jsx` (real orders + RPC take_order)
- [x] Modify `driver/pendapatan/page.jsx` (real earnings data)

## Fase 6: History & WhatsApp
- [x] Modify `user/history/page.jsx` (real data + WA + cancel)
- [x] Modify `driver/history/page.jsx` (real data)

## Fase 7: PDF Export
- [x] Create `lib/pdf.js` (PDF generator utilities)
- [x] Add PDF button to `user/history/page.jsx`
- [x] Implement PDF export in `driver/pendapatan/page.jsx`

## Final Verification
- [x] `npm run build` passes
- [x] `npm run lint` passes
