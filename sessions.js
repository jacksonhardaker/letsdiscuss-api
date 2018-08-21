module.exports = (function() {

    const _sessions = {};

    function remove(token) {
        _sessions[token] = null;
        delete _sessions[token];
    }

    function add(session) {
        _sessions[session.token] = session;
    }

    function get(token) {
        return token ? _sessions[token] : _sessions;
    }

    return {
        remove,
        add,
        get
    }
})();