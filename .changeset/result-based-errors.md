## "@oaknetwork/api": major

Adopt Result<T, E> responses across API services and auth flows.
This change introduces a breaking change to all API responses, which now return a Result<T, E> type. This means that instead of returning data directly, API endpoints will return either a successful result (Ok) or an error (Err).
