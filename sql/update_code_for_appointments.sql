-- After running migrate_to_appointments.sql, update the frontend code
-- This is documentation for what changes in the code

/*

CHANGES NEEDED IN FRONTEND CODE:

1. ManageBookings.tsx - Update fetchBookings()
   - Change from 'booked_sessions' to 'appointments'
   - Query where recipient_id = current_user_profile_id AND status = 'pending'

2. Dashboard/coaches/page.tsx - Update Upcoming Sessions
   - Change from 'booked_sessions' to 'appointments'
   - Show where (requested_by = me AND status = 'accepted') 
   - OR (recipient_id = me AND status = 'accepted')
   - Both users see it after acceptance

3. Profile booking flow
   - Change INSERT from 'booked_sessions' to 'appointments'
   - Set requested_by = current user
   - Set recipient_id = coach_id
   - Set status = 'pending'

4. Accept/Decline logic
   - Update 'appointments' table
   - Set status = 'accepted' or 'declined'
   - responded_at will auto-update via trigger

TABLE STRUCTURE:
- appointments.id
- appointments.requested_by (who booked)
- appointments.recipient_id (who needs to approve)
- appointments.athlete_id
- appointments.coach_id
- appointments.status (pending/accepted/declined/cancelled/completed)
- appointments.session_date
- appointments.start_time
- appointments.end_time
- appointments.booked_at
- appointments.responded_at
- appointments.room_url (for video calls)

RLS POLICIES:
- Users can view appointments where they're involved
- Users can create appointments (as requester)
- Recipients can update status (accept/decline)

*/
