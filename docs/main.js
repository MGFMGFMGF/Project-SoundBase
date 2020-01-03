
window.onload = init
function init() {
    view.showComponent("loading")
    firebase.auth().onAuthStateChanged(authStateChangeHandler)

    function authStateChangeHandler(user) {
        if(view.currentScreen == 'register')
            return
        if (user && user.emailVerified) {

            view.showComponent("page")
            
        } else {
            view.showComponent("login")
        }
    }
}
