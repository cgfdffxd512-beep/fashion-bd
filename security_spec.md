# Security Specification & Payload-First TDD

## 1. Data Invariants
1. **Owner & Admin Integrity**: Only the verified primary owner (`cgfdffxd512@gmail.com` with `email_verified == true`) or verified users listed in `/admins/{uid}` may read/modify store settings, products, categories, pages, customers, or update order statuses. Only the primary owner may add or remove `/admins/{uid}`.
2. **PII Isolation**: `/orders` and `/customers` contain PII (`customerPhone`, `customerEmail`, `shippingAddress`). Unauthenticated users and non-owner signed-in users can NEVER list or read someone else's order or customer record.
3. **Order Creation Integrity**: Guests or signed-in shoppers may create an order in `/orders/{orderId}`, strictly constrained to `status == 'pending'`, valid server timestamp `createdAt == request.time`, `updatedAt == request.time`, valid numeric totals (`>= 0`), bounded line items (`1 <= items.size() <= 30`), and `customerUid` matching either `'guest'` (when unauthenticated) or `request.auth.uid` (when authenticated).
4. **Immutable Ownership & Timestamps**: `createdAt` and `customerUid` are immutable after creation; `updatedAt` must equal `request.time` on writes.
5. **Strict Key & Size Enforcement**: Every collection enforces exact `hasAll` / `hasOnly` key allowlists and explicit `.size()` upper bounds on all strings and arrays.

## 2. Dirty Dozen Adversarial Payloads
1. **Unverified Admin Email Spoof**: User with `email: 'cgfdffxd512@gmail.com'` and `email_verified: false` tries to update `/settings/site` -> `PERMISSION_DENIED`.
2. **Privilege Escalation (Self-Admin)**: Authenticated customer writes `/admins/{uid}` with `role: 'owner'` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Product**: Non-admin or admin injects unknown field `isVerified: true` into `/products/p1` -> `PERMISSION_DENIED`.
4. **Order Status Bypass on Create**: Customer creates `/orders/o1` with `status: 'delivered'` -> `PERMISSION_DENIED`.
5. **Order UID Spoofing**: Signed-in user A creates `/orders/o2` with `customerUid: 'user_B'` -> `PERMISSION_DENIED`.
6. **PII Order Scraping**: Authenticated user A runs `list` on `/orders` without `customerUid == auth.uid` filter -> `PERMISSION_DENIED`.
7. **PII Customer Directory Read**: Authenticated non-admin attempts `get` or `list` on `/customers` -> `PERMISSION_DENIED`.
8. **Negative Price Poisoning**: Admin/attacker attempts to create `/products/p2` with `price: -500` -> `PERMISSION_DENIED`.
9. **Resource Poisoning via Oversized ID**: Attacker creates `/orders/<200-char-id>` or `/orders/bad$id` -> `PERMISSION_DENIED`.
10. **Client Timestamp Forgery**: Payload supplies `createdAt: Timestamp(2020-01-01)` instead of `request.time` -> `PERMISSION_DENIED`.
11. **Array Flood Attack**: Order payload includes 500 items or Product payload includes 100 sizes -> `PERMISSION_DENIED`.
12. **Customer Order Tampering**: Signed-in customer tries to update `totalAmount` or `status` on their own existing order -> `PERMISSION_DENIED`.
