function normalizeBaseUrl(value) {
    return value ? value.trim().replace(/\/+$/, '') : '';
}

function getConfiguredApiBaseUrl() {
    return normalizeBaseUrl(
        import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
    );
}

function normalizePath(path) {
    return path.startsWith('/') ? path : `/${path}`;
}

function removeDuplicateApiPrefix(baseUrl, path) {
    if (!baseUrl.endsWith('/api')) {
        return path;
    }

    if (path === '/api') {
        return '';
    }

    return path.startsWith('/api/') ? path.slice(4) : path;
}

export function buildApiUrl(path) {
    const normalizedPath = normalizePath(path);
    const baseUrl = getConfiguredApiBaseUrl();

    if (!baseUrl) {
        return normalizedPath;
    }

    return `${baseUrl}${removeDuplicateApiPrefix(baseUrl, normalizedPath)}`;
}
