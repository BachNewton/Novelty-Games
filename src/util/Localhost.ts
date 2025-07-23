export function isLocalhost(): boolean {
    if (window.location.hostname === 'localhost') return true;

    // [::1] is the IPv6 localhost address.
    if (window.location.hostname === '[::1]') return true;

    // 127.0.0.0/8 are considered localhost for IPv4.
    if (window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)) return true;

    return false;
}
