//Böngészőhöz kötött azonosító (ugyanaz a logika, mint a LandScene-ben)
export function getBrowserId() {
    let id = localStorage.getItem('browser_id')

    if (!id) {
        const fingerprint = navigator.userAgent + navigator.language + screen.width
        id = btoa(fingerprint).slice(0, 24)
        localStorage.setItem('browser_id', id)
    }
    return id
}

export const API_URL = 'https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev'
