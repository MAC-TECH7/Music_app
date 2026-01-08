// Utility script for AfroRhythm project
window.afro = window.afro || {};

/**
 * Robustly determines the project root URL path.
 * Works whether the project is at the domain root or in a subdirectory.
 */
window.afro.getProjectRoot = function () {
    const pathname = window.location.pathname;
    const isAuth = pathname.includes('/auth/');

    // Split by / and remove empty entries and .html filenames
    let parts = pathname.split('/').filter(p => p !== "" && !p.endsWith('.html'));

    if (isAuth) {
        // If we're inside the /auth/ directory, the project root is one level up
        if (parts[parts.length - 1] === 'auth') {
            parts.pop();
        }
    }

    const root = '/' + parts.join('/');
    // Ensure it doesn't end with double slash if root is empty
    return root === '//' ? '/' : (root.endsWith('/') ? root.slice(0, -1) : root);
};

/**
 * Helper to redirect to a specific page relative to project root
 */
window.afro.redirectTo = function (targetPath) {
    const root = window.afro.getProjectRoot();
    const target = (root === '/' ? '' : root) + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);

    console.log("🚀 AfroRhythm Redirecting...");
    console.log("📍 Current Pathname:", window.location.pathname);
    console.log("📂 Calculated Root:", root);
    console.log("🎯 Final Target:", target);

    window.location.href = target;
};
