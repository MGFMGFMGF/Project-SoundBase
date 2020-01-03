const view = {
    currentScreen: '',
    tempAccount: {},
    tempFriendId: {},
}
view.showComponent = async function (name) {
    switch (name) {
        case 'register': {
            let app = document.getElementById('app')
            app.innerHTML = component.register

            let link = document.getElementById('login-link')
            link.onclick = linkClickHandler

            function linkClickHandler() {
                view.showComponent('login')
            }

            let form = document.getElementById('register-form')
            form.onsubmit = formSubmitHandler

            function formSubmitHandler(event) {
                event.preventDefault()
                // lay thong tin user 
                let registerInfo = {
                    firstName: form.firstName.value,
                    lastName: form.lastName.value,
                    nickName: form.nickName.value,
                    email: form.email.value,
                    password: form.password.value,
                    confirmPassword: form.confirmPassword.value
                }
                // validate thong tin 
                let conditionArray = []
                let idErrorTagArray = []
                let messageErrorArray = []

                // /** set values Pass truoc, Confirm Pass sau*/
                let conditionPass0 = registerInfo.password //0
                let conditionPass1 = registerInfo.password.length >= 6 //1
                let conditionConfirmPass0 = registerInfo.confirmPassword //2
                let conditionConfirmPass1 = registerInfo.confirmPassword == registerInfo.password //3
                let idErrorTagPass = "password-error" //0
                let idErrorTagConfirmPass = "confirmPassword-error" //1
                let messageErrorPass0 = "Password must be at least 6 characters" //0
                let messageErrorPass1 = "Must type Password" //1
                let messageErrorConfirmPass0 = "Password not match" //2
                let defaultMessageError = ""

                /** push into array using splice*/
                conditionArray.splice(0, 1, conditionPass0)
                conditionArray.splice(1, 1, conditionPass1)
                conditionArray.splice(2, 1, conditionConfirmPass0)
                conditionArray.splice(3, 1, conditionConfirmPass1)
                idErrorTagArray.splice(0, 1, idErrorTagPass)
                idErrorTagArray.splice(1, 1, idErrorTagConfirmPass)
                messageErrorArray.splice(0, 1, messageErrorPass0)
                messageErrorArray.splice(1, 1, messageErrorPass1)
                messageErrorArray.splice(2, 1, messageErrorConfirmPass0)

                let validateResult = [
                    view.validate(registerInfo.firstName, "firstname-error", "Invalid first name"),
                    view.validate(registerInfo.lastName, "lastname-error", "Invalid last name"),
                    view.validate(registerInfo.email
                        && registerInfo.email.includes('@'),
                        "email-error",
                        "Invalid email"),
                    view.validateTest(conditionArray, idErrorTagArray, messageErrorArray, defaultMessageError)
                ]

                // submit information
                if (allPassed(validateResult)) {
                    controller.register(registerInfo)
                }
            }
            break
        }
        case 'login': {
            let app = document.getElementById('app')
            app.innerHTML = component.login

            let link = document.getElementById('register-link')
            link.onclick = linkClickHandler

            let form = document.getElementById('login-form')
            form.onsubmit = formSubmitHandler
            //form.onsubmit = alert("You have submitted")
            function linkClickHandler() {
                view.showComponent('register')
            }

            function formSubmitHandler(event) {
                event.preventDefault()
                let loginInfo = {
                    email: form.email.value,
                    password: form.password.value,
                }

                let validateResult = [
                    view.validate(loginInfo.email
                        && loginInfo.email.includes('@'),
                        "email-error",
                        "Invalid email"),
                    view.validate(loginInfo.password
                        && loginInfo.password.length >= 6,
                        "password-error",
                        "Incorrect Password")
                ]

                console.log(validateResult)
                if (allPassed(validateResult)) {
                    controller.login(loginInfo)
                }
            }

            break
        }
        case 'loading': {
            let app = document.getElementById('app')
            app.innerHTML = component.loading

            break
        }
        case 'page': {
            //plan B for download (don't delete this)
            songsOnMainPage = []
            // console.log(songsOnMainPage)

            //Get nick name of user
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName


            // ----------------------------DISPLAY & DROPDOWN---------------------
            let app = document.getElementById('app')
            app.innerHTML = component.homepage + component.nav + component.dropDownMenu


            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent += nickName

            let dropDownBtn = document.getElementById('more-information-btn')
            dropDownBtn.onclick = dropDownClickHandler
            let dropDownMenu = document.getElementById('more-information-menu')
            dropDownMenu.style.display = 'none'
            let isDropDown = false

            function dropDownClickHandler(event) {
                event.preventDefault()
                if (isDropDown == false) {
                    isDropDown = true
                    dropDownMenu.style.display = 'block'
                } else {
                    isDropDown = false
                    dropDownMenu.style.display = 'none'
                }
            }
            //-----------------------------ANNOUNCEMENT--------------------------------
            let announcement = document.getElementById("announcement-list")
            announcement.innerHTML = ""
            let maxAnnounce = user.announcements.length
            if (maxAnnounce > 5) {
                maxAnnounce = 5
            }
            if (maxAnnounce == 0) {
                announcement.innerHTML += "There are no new announcements"
            }
            for (let i = 0; i < maxAnnounce; i++) {
                announcement.innerHTML += `
                <li class="announcement">${user.announcements[user.announcements.length - 1 - i]}</li>
                `
            }


            //--------------------------LEADERBOARD------------------------------------
            let leaderboard = document.getElementById("leaderboard-content")
            leaderboard.innerHTML = ""

            let userNumSongsDoc = await firebase.firestore().collection("users").orderBy("numSongs", "desc").limit(10).get()
            let userTest = await firebase.firestore().collection("users").get()
            let loopCnt = 10
            if (userTest.size < 10) {
                loopCnt = userTest.size
            }
            for (i = 0; i < loopCnt; i++) {
                let artistId = userNumSongsDoc.docs[i].id
                let songNumRef = await firebase.firestore().collection("users").doc(artistId).get()
                let songNumDoc = transformDoc(songNumRef)
                let songNumArtist = songNumDoc.nickName
                let songNum = songNumDoc.numSongs

                leaderboard.innerHTML += `
                <div class="leaderboard-info">
                <div class="leaderboard-artist">${songNumArtist}</div>
                <div class="leaderboard-tracks">${songNum}</div>
                </div>
                `
            }

            //---------------GET NEWEST SONG FOR LAYOUT & DOWNLOAD-----------------------------
            let songsContainer = document.getElementById("songs-container")
            songsContainer.innerHTML = ""

            //Change limit value for more/less songs on the screen
            let songDoc = await firebase.firestore().collection("songs").orderBy("createdAt", "desc").limit(2).get()
            for (i = 0; i < 2; i++) {
                let tempEmail = await firebase.auth().currentUser.email

                let tempId = songDoc.docs[i].id
                songsOnMainPage.push(tempId)
                let songInfoDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                let songInfo = transformDoc(songInfoDoc)

                let likedYetList = songInfo.likedBy

                let title = songInfo.title
                let creatorNickName = songInfo.creatorNickName
                let url = songInfo.url

                let imgUrl = songInfo.imgUrl


                songsContainer.innerHTML += `
                <div class="song-container" id = ${tempId}>
                <div class="song">
                    <div class="song-image" id="song-image-${tempId}" onclick="console.log('${songInfo.description}')">
                    </div>
                    <div class="song-aside-right">
                        <div class="song-info">
                            <div class="song-info-detail">
                                <div class="song-name">${title}</div>
                                <div class="song-artist">by ${creatorNickName}</div>
                            </div>
                            <button onclick="window.open('${url}')" class="btn-icon download-btn" name="download" id="download-btn-${tempId}"><i class="fas fa-arrow-down"></i></button>
                            <button class="btn-icon report-button" id="report-btn-${tempId}"><i class="fas fa-exclamation-circle"></i></button>
                        </div>
                        <div class="song-buttons">
                            <div class="audio-container">
                                <audio src="${url}" controls="controls" type="audio/mpeg" class="audio" id="play-btn-${tempId}"></audio>  
                            </div>
                            <button title"numLikes" class="btn-icon love-button" id="love-btn-${tempId}"><i class="fas fa-heart"></i></button>
                            <button class="btn-icon comment-button" id="comment-btn-${tempId}"><i class="fas fa-comment-alt"></i></button>
                            <button class="btn-icon save-button" id="save-btn-${tempId}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <div class="song-comments">
                    <form class="song-comment-bar">
                        <div class="comment-input-container">
                            <input type="text" name="comment" placeholder="Write a comment">
                        </div>
                    </form>
                    <div class="song-comment-container">
                    </div>
                    <div class="song-view-more">show more comments</div>
                </div>
            </div>
                `
                //Change color of LOVE button when loading page (incomplete) (don't delete this)
                let loveButton = document.getElementById("love-btn-" + tempId)
                if (likedYetList.includes(tempEmail)) {
                    loveButton.style.background = "purple"
                }

                let imgLoader = document.getElementById("song-image-" + tempId)
                imgLoader.style.backgroundImage = `url('${imgUrl}')`

            }
            //Add event to IMAGE
            for (i = 0; i < songsOnMainPage.length; i++) {
                let imgDiv = document.getElementById("song-image-" + songsOnMainPage[i])
                imgDiv.addEventListener('click', async function () {
                    if (imgDiv.style.background.includes("black")) {
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let imgUrl = song.imgUrl
                        imgDiv.style.background = "center center no-repeat"
                        imgDiv.style.backgroundSize = "cover"
                        imgDiv.style.backgroundImage = `url('${imgUrl}')`
                        imgDiv.style.backgroundColor = "aqua"
                        imgDiv.innerText = ""
                    }
                    else {
                        imgDiv.style.background = "black"
                        imgDiv.style.padding = "10px"
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let genre = song.genre
                        let description = song.description
                        // let tempText = ""
                        imgDiv.innerText = "Description: " + description
                        splitText = imgDiv.innerText.split(" ")
                        numChar = []
                        for (i = 0; i < splitText.length; i++) {
                            numChar.push(splitText[i].length)
                        }
                        console.log(numChar)
                        let sumCheck = 0
                        tempText = ""
                        for (i = 0; i < numChar.length; i++) {
                            sumCheck += numChar[i]
                            if (sumCheck > 29) {
                                tempText += "\n" + splitText[i] + " "
                                sumCheck = numChar[i]
                            }
                            else {
                                tempText += splitText[i] + " "
                            }
                        }
                        imgDiv.innerText = "Genre: " + genre + "\n" + tempText
                        //Genre co the xu ly nhu description nhung genre thuong ngan hon-->chi viet ra
                    }
                })

            }

            //Add event to REPORT button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let reportButton = document.getElementById("report-btn-" + songsOnMainPage[i])
                reportButton.addEventListener('click', async function (e) {
                    e.preventDefault()

                    view.reportId = reportButton.parentNode.parentNode.parentNode.parentNode.id
                    let songInfoDoc = await firebase.firestore().collection("songs").doc(view.reportId).get()
                    let songInfo = transformDoc(songInfoDoc)
                    view.userReported = songInfo.creatorNickName
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songInfo.creator).get()
                    view.suspectId = ref.docs[0].id
                    view.songReported = songInfo.title
                    console.log(view.reportId)
                    console.log(view.userReported)
                    view.showComponent("report")
                })
            }

            //Add event to button for NOW PLAYING feature
            for (i = 0; i < songsOnMainPage.length; i++) {
                let playButton = document.getElementById("play-btn-" + songsOnMainPage[i])
                playButton.addEventListener('play', async function (e) {
                    var audios = document.getElementsByTagName('audio');
                    for (var i = 0, len = audios.length; i < len; i++) {
                        if (audios[i] != e.target) {
                            audios[i].pause();
                        }
                    }
                    let currentSongImage = document.getElementById("current-song-image")
                    let currentSongName = document.getElementById("current-song-name")
                    let currentSongArtist = document.getElementById("current-song-artist")
                    playingId = playButton.parentNode.parentNode.parentNode.parentNode.parentNode.id
                    let playingRef = await firebase.firestore().collection("songs").doc(playingId).get()
                    let playing = transformDoc(playingRef)
                    let imgUrl = playing.imgUrl
                    let songName = playing.title
                    let songCreator = playing.creatorNickName
                    currentSongName.innerText = ""
                    currentSongArtist.innerText = ""
                    currentSongName.innerText += songName
                    currentSongArtist.innerText += songCreator
                    // currentSongImage.style.backgroundImage = ''
                    if (currentSongImage) {
                        currentSongImage.style.backgroundImage = `url('${imgUrl}')`
                    }
                    else {
                        console.log("dump")
                    }
                })
            }

            //Add event to COMMENT button + a little update to css, controller and model
            for (let i = 0; i < songsOnMainPage.length; i++) {
                let commentButton = document.getElementById("comment-btn-" + songsOnMainPage[i])
                let commentsElement = commentButton.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("song-comments")[0]
                //Hover to see number of COMMENTS
                let parentId = commentButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)
                let comments = songDoc.comments
                commentButton.title = "Comments: " + songDoc.numComments
                //Button clicked
                commentButton.addEventListener('click', function (e) {
                    e.preventDefault()
                    if (commentsElement.style.display != 'block') {
                        commentsElement.style.display = 'block'
                    } else {
                        commentsElement.style.display = 'none'
                    }
                })
                //Show Comments
                view.showComments(parentId, comments)
                //CommentBar
                let formComment = commentsElement.getElementsByClassName("song-comment-bar")[0]
                formComment.onsubmit = formCommentSubmitHandler
                function formCommentSubmitHandler(e) {
                    e.preventDefault()
                    // get message content
                    let commentContent = e.target.comment.value.trim()
                    // update database
                    if (commentContent) {
                        controller.addComment(parentId, commentContent, nickName)
                    }
                }
                //----working---
            }

            //Add event to LOVE button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let loveButton = document.getElementById("love-btn-" + songsOnMainPage[i])

                //Hover to see number of LIKES
                let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)

                loveButton.title = "Likes: " + songDoc.numLikes

                loveButton.addEventListener('click', async function (e) {
                    let likedYet = false
                    let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                    console.log(parentId)
                    let userEmail = await firebase.auth().currentUser.email
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", userEmail).get()

                    let doc = await firebase.firestore().collection("users").doc(ref.docs[0].id).get()
                    let userLove = transformDoc(doc)
      
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let likedBy = songDoc.likedBy

                    let refForCreator = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songDoc.creator).get()
                    let userLoveID = refForCreator.docs[0].id

                    for (i = 0; i < likedBy.length; i++) {
                        if (likedBy[i] == userEmail) {
                            likedYet = true
                        }
                    }
                    //UPDATE DOCUMENT
                    if (likedYet) {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayRemove(parentId),
                        })

                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(-1)
                        })
                        loveButton.style.background = 'red'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) - 1
                        loveButton.title = "Likes: " + num
                    }
                    else {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(parentId),
                        })

                        let loveNoti = "<span class='boldText'>" + userLove.nickName + "</span>" + " liked your song " + "<span class='boldText'>" + songDoc.title + "</span>"

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(userLoveID)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(loveNoti),
                            })


                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(1)
                        })
                        loveButton.style.background = 'purple'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) + 1
                        loveButton.title = "Likes: " + num
                    }

                })

            }

            //Update document for BOOKMARK feature
            for (i = 0; i < songsOnMainPage.length; i++) {
                let saveButton = document.getElementById("save-btn-" + songsOnMainPage[i])
                saveButton.addEventListener('click', async function (e) {
                    let haveIdYet = false
                    savingId = saveButton.parentNode.parentNode.parentNode.parentNode.id
                    favoriteSongsIdList = user.favoriteSongsId
                    for (i = 0; i < favoriteSongsIdList.length; i++) {
                        if (savingId == favoriteSongsIdList[i]) {
                            haveIdYet = true
                        }
                    }
                    if (!haveIdYet) {
                        await firebase.firestore().collection("users").doc(userID).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(savingId)
                        })
                    }

                })
            }

            //Plan B for download (don't delete this)
            // console.log(songsOnMainPage)
            // for (i=0;i<songsOnMainPage.length;i++){
            //     let downloadButton = document.getElementById("download-btn-" + songsOnMainPage[i])
            //     downloadButton.addEventListener("click", async function(){

            //     })
            // }
            //--------------FriendAccount---------
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()
            // ---------------------------SIGNOUT------------------------------
            let btnSignOut = document.getElementById("sign-out-btn")
            btnSignOut.onclick = signOut

            function signOut() {
                firebase.auth().signOut()
            }

            break
        }
        case 'mySongs': {
            songsOnMainPage = []

            //Get nick name of user
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName
            console.log(nickName)


            // ----------------------------DISPLAY & DROPDOWN---------------------
            let app = document.getElementById('app')
            app.innerHTML = component.mySongs + component.nav + component.dropDownMenu


            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent += nickName

            let dropDownBtn = document.getElementById('more-information-btn')
            dropDownBtn.onclick = dropDownClickHandler
            let dropDownMenu = document.getElementById('more-information-menu')
            dropDownMenu.style.display = 'none'
            let isDropDown = false

            function dropDownClickHandler(event) {
                event.preventDefault()
                if (isDropDown == false) {
                    isDropDown = true
                    dropDownMenu.style.display = 'block'
                } else {
                    isDropDown = false
                    dropDownMenu.style.display = 'none'
                }
            }

            //---------------GET OWNED SONG FOR LAYOUT & DOWNLOAD-----------------------------
            let songsContainer = document.getElementById("songs-container")
            if (songsContainer) {
                console.log("ok")
            }
            else {
                console.log("nonono")
            }
            // songsContainer.innerHTML = ""

            //Change limit value for more/less songs on the screen
            let songDoc = user.songsId
            console.log(songDoc)
            for (i = 0; i < songDoc.length; i++) {
                let tempEmail = await firebase.auth().currentUser.email

                let tempId = songDoc[i]
                songsOnMainPage.push(tempId)
                let songInfoDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                let songInfo = transformDoc(songInfoDoc)

                let likedYetList = songInfo.likedBy

                let title = songInfo.title
                let creatorNickName = songInfo.creatorNickName
                let url = songInfo.url

                let imgUrl = songInfo.imgUrl
                songsContainer.innerHTML += `
                <div class="song-container" id = ${tempId}>
                <div class="song">
                    <div class="song-image" id="song-image-${tempId}"></div>
                    <div class="song-aside-right">
                        <div class="song-info">
                            <div class="song-info-detail">
                                <div class="song-name">${title}</div>
                                <div class="song-artist">by ${creatorNickName}</div>
                            </div>
                            <button onclick="window.open('${url}')" class="btn-icon download-btn" name="download" id="download-btn-${tempId}"><i class="fas fa-arrow-down"></i></button>
                            <button class="btn-icon report-button" id="report-btn-${tempId}"><i class="fas fa-exclamation-circle"></i></button>
                        </div>
                        <div class="song-buttons">
                            <div class="audio-container">
                                <audio src="${url}" controls="controls" type="audio/mpeg" class="audio" id="play-btn-${tempId}"></audio>  
                            </div>
                            <button title="numLikes" class="btn-icon love-button" id="love-btn-${tempId}"><i class="fas fa-heart"></i></button>
                            <button class="btn-icon comment-button" id="comment-btn-${tempId}"><i class="fas fa-comment-alt"></i></button>
                            <button class="btn-icon save-button" id="save-btn-${tempId}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <div class="song-comments">
                    <form class="song-comment-bar">
                        <div class="comment-input-container">
                            <input type="text" name="comment" placeholder="Write a comment">
                        </div>
                    </form>
                    <div class="song-comment-container">
                    </div>
                    <div class="song-view-more">show more comments</div>
                </div>
            </div>
                `
                //Change color of LOVE button when loading page (incomplete) (don't delete this)
                let loveButton = document.getElementById("love-btn-" + tempId)
                if (likedYetList.includes(tempEmail)) {
                    loveButton.style.background = "purple"
                }

                let imgLoader = document.getElementById("song-image-" + tempId)
                imgLoader.style.backgroundImage = `url('${imgUrl}')`
            }

            //Play one song, stop others
            for (i = 0; i < songsOnMainPage.length; i++) {
                let playButton = document.getElementById("play-btn-" + songsOnMainPage[i])
                playButton.addEventListener('play', async function (e) {
                    var audios = document.getElementsByTagName('audio');
                    for (var i = 0, len = audios.length; i < len; i++) {
                        if (audios[i] != e.target) {
                            audios[i].pause();
                        }
                    }
                })
            }

            //Add event to IMAGE
            for (i = 0; i < songsOnMainPage.length; i++) {
                let imgDiv = document.getElementById("song-image-" + songsOnMainPage[i])
                imgDiv.addEventListener('click', async function () {
                    if (imgDiv.style.background.includes("black")) {
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let imgUrl = song.imgUrl
                        imgDiv.style.background = "center center no-repeat"
                        imgDiv.style.backgroundSize = "cover"
                        imgDiv.style.backgroundImage = `url('${imgUrl}')`
                        imgDiv.style.backgroundColor = "aqua"
                        imgDiv.innerText = ""
                    }
                    else {
                        imgDiv.style.background = "black"
                        imgDiv.style.padding = "10px"
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let genre = song.genre
                        let description = song.description
                        // let tempText = ""
                        imgDiv.innerText = "Description: " + description
                        splitText = imgDiv.innerText.split(" ")
                        numChar = []
                        for (i = 0; i < splitText.length; i++) {
                            numChar.push(splitText[i].length)
                        }
                        console.log(numChar)
                        let sumCheck = 0
                        tempText = ""
                        for (i = 0; i < numChar.length; i++) {
                            sumCheck += numChar[i]
                            if (sumCheck > 29) {
                                tempText += "\n" + splitText[i] + " "
                                sumCheck = numChar[i]
                            }
                            else {
                                tempText += splitText[i] + " "
                            }
                        }
                        imgDiv.innerText = "Genre: " + genre + "\n" + tempText
                    }
                })

            }

            //Add event to REPORT button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let reportButton = document.getElementById("report-btn-" + songsOnMainPage[i])
                reportButton.addEventListener('click', async function (e) {
                    e.preventDefault()

                    view.reportId = reportButton.parentNode.parentNode.parentNode.parentNode.id
                    let songInfoDoc = await firebase.firestore().collection("songs").doc(view.reportId).get()
                    let songInfo = transformDoc(songInfoDoc)
                    view.userReported = songInfo.creatorNickName
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songInfo.creator).get()
                    view.suspectId = ref.docs[0].id
                    view.songReported = songInfo.title
                    console.log(view.reportId)
                    console.log(view.userReported)
                    view.showComponent("report")
                })
            }

            //Add event to COMMENT button + a little update to css, controller and model
            for (let i = 0; i < songsOnMainPage.length; i++) {
                let commentButton = document.getElementById("comment-btn-" + songsOnMainPage[i])
                let commentsElement = commentButton.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("song-comments")[0]
                //Hover to see number of COMMENTS
                let parentId = commentButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)
                let comments = songDoc.comments
                commentButton.title = "Comments: " + songDoc.numComments
                //Button clicked
                commentButton.addEventListener('click', function (e) {
                    e.preventDefault()
                    if (commentsElement.style.display != 'block') {
                        commentsElement.style.display = 'block'
                    } else {
                        commentsElement.style.display = 'none'
                    }
                })
                //Show Comments
                view.showComments(parentId, comments)
                //CommentBar
                let formComment = commentsElement.getElementsByClassName("song-comment-bar")[0]
                formComment.onsubmit = formCommentSubmitHandler
                function formCommentSubmitHandler(e) {
                    e.preventDefault()
                    // get message content
                    let commentContent = e.target.comment.value.trim()
                    // update database
                    if (commentContent) {
                        controller.addComment(parentId, commentContent, nickName)
                    }
                }
                //----working---
            }

            //Add event to LOVE button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let loveButton = document.getElementById("love-btn-" + songsOnMainPage[i])

                //Hover to see number of LIKES
                let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)

                loveButton.title = "Likes: " + songDoc.numLikes

                loveButton.addEventListener('click', async function (e) {
                    let likedYet = false
                    let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                    console.log(parentId)
                    let userEmail = await firebase.auth().currentUser.email
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", userEmail).get()

                    let doc = await firebase.firestore().collection("users").doc(ref.docs[0].id).get()
                    let userLove = transformDoc(doc)
      
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let likedBy = songDoc.likedBy

                    let refForCreator = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songDoc.creator).get()
                    let userLoveID = refForCreator.docs[0].id

                    for (i = 0; i < likedBy.length; i++) {
                        if (likedBy[i] == userEmail) {
                            likedYet = true
                        }
                    }
                    //UPDATE DOCUMENT
                    if (likedYet) {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayRemove(parentId),
                        })

                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(-1)
                        })
                        loveButton.style.background = 'red'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) - 1
                        loveButton.title = "Likes: " + num
                    }
                    else {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(parentId),
                        })

                        let loveNoti = "<span class='boldText'>" + userLove.nickName + "</span>" + " liked your song " + "<span class='boldText'>" + songDoc.title + "</span>"

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(userLoveID)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(loveNoti),
                            })


                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(1)
                        })
                        loveButton.style.background = 'purple'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) + 1
                        loveButton.title = "Likes: " + num
                    }

                })

            }

            //--------------FriendAccount---------
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()
            //-----------------------SIGNOUT---------------------------
            let btnSignOut = document.getElementById("sign-out-btn")
            btnSignOut.onclick = signOut

            function signOut() {
                firebase.auth().signOut()
            }
            break
        }
        case 'bookmark': {
            songsOnMainPage = []

            //Get nick name of user
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName
            console.log(nickName)

            // ----------------------------DISPLAY & DROPDOWN---------------------
            let app = document.getElementById('app')
            app.innerHTML = component.bookmark + component.nav + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent += nickName

            let dropDownBtn = document.getElementById('more-information-btn')
            dropDownBtn.onclick = dropDownClickHandler
            let dropDownMenu = document.getElementById('more-information-menu')
            dropDownMenu.style.display = 'none'
            let isDropDown = false

            function dropDownClickHandler(event) {
                event.preventDefault()
                if (isDropDown == false) {
                    isDropDown = true
                    dropDownMenu.style.display = 'block'
                } else {
                    isDropDown = false
                    dropDownMenu.style.display = 'none'
                }
            }

            //---------------GET SAVED SONG FOR LAYOUT & DOWNLOAD-----------------------------
            let songsContainer = document.getElementById("songs-container")
            if (songsContainer) {
                console.log("ok")
            }
            else {
                console.log("nonono")
            }
            // songsContainer.innerHTML = ""

            //Change limit value for more/less songs on the screen
            let songDoc = user.favoriteSongsId
            console.log(songDoc)
            for (i = 0; i < songDoc.length; i++) {
                let tempEmail = await firebase.auth().currentUser.email

                let tempId = songDoc[i]
                songsOnMainPage.push(tempId)
                let songInfoDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                let songInfo = transformDoc(songInfoDoc)

                let likedYetList = songInfo.likedBy

                let title = songInfo.title
                let creatorNickName = songInfo.creatorNickName
                let url = songInfo.url

                let imgUrl = songInfo.imgUrl
                songsContainer.innerHTML += `
                <div class="song-container" id = ${tempId}>
                <div class="song">
                    <div class="song-image" id="song-image-${tempId}"></div>
                    <div class="song-aside-right">
                        <div class="song-info">
                            <div class="song-info-detail">
                                <div class="song-name">${title}</div>
                                <div class="song-artist">by ${creatorNickName}</div>
                            </div>
                            <button onclick="window.open('${url}')" class="btn-icon download-btn" name="download" id="download-btn-${tempId}"><i class="fas fa-arrow-down"></i></button>
                            <button class="btn-icon report-button" id="report-btn-${tempId}"><i class="fas fa-exclamation-circle"></i></button>
                        </div>
                        <div class="song-buttons">
                            <div class="audio-container">
                                <audio src="${url}" controls="controls" type="audio/mpeg" class="audio" id="play-btn-${tempId}"></audio>  
                            </div>
                            <button title = "numLikes" class="btn-icon love-button" id="love-btn-${tempId}"><i class="fas fa-heart"></i></button>
                            <button class="btn-icon comment-button" id="comment-btn-${tempId}"><i class="fas fa-comment-alt"></i></button>
                            <button class="btn-icon save-button" id="save-btn-${tempId}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <div class="song-comments">
                    <form class="song-comment-bar">
                        <div class="comment-input-container">
                            <input type="text" name="comment" placeholder="Write a comment">
                        </div>
                    </form>
                    <div class="song-comment-container">
                    </div>
                    <div class="song-view-more">show more comments</div>
                </div>
            </div>
                `
                //Change color of LOVE button when loading page (incomplete) (don't delete this)
                let loveButton = document.getElementById("love-btn-" + tempId)
                if (likedYetList.includes(tempEmail)) {
                    loveButton.style.background = "purple"
                }


                let imgLoader = document.getElementById("song-image-" + tempId)
                imgLoader.style.backgroundImage = `url('${imgUrl}')`
            }

            //Play one song, stop others
            for (i = 0; i < songsOnMainPage.length; i++) {
                let playButton = document.getElementById("play-btn-" + songsOnMainPage[i])
                playButton.addEventListener('play', async function (e) {
                    var audios = document.getElementsByTagName('audio');
                    for (var i = 0, len = audios.length; i < len; i++) {
                        if (audios[i] != e.target) {
                            audios[i].pause();
                        }
                    }
                })
            }

            //Add event to IMAGE
            for (i = 0; i < songsOnMainPage.length; i++) {
                let imgDiv = document.getElementById("song-image-" + songsOnMainPage[i])
                imgDiv.addEventListener('click', async function () {
                    if (imgDiv.style.background.includes("black")) {
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let imgUrl = song.imgUrl
                        imgDiv.style.background = "center center no-repeat"
                        imgDiv.style.backgroundSize = "cover"
                        imgDiv.style.backgroundImage = `url('${imgUrl}')`
                        imgDiv.style.backgroundColor = "aqua"
                        imgDiv.innerText = ""
                    }
                    else {
                        imgDiv.style.background = "black"
                        imgDiv.style.padding = "10px"
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let genre = song.genre
                        let description = song.description
                        // let tempText = ""
                        imgDiv.innerText = "Description: " + description
                        splitText = imgDiv.innerText.split(" ")
                        numChar = []
                        for (i = 0; i < splitText.length; i++) {
                            numChar.push(splitText[i].length)
                        }
                        console.log(numChar)
                        let sumCheck = 0
                        tempText = ""
                        for (i = 0; i < numChar.length; i++) {
                            sumCheck += numChar[i]
                            if (sumCheck > 29) {
                                tempText += "\n" + splitText[i] + " "
                                sumCheck = numChar[i]
                            }
                            else {
                                tempText += splitText[i] + " "
                            }
                        }
                        imgDiv.innerText = "Genre: " + genre + "\n" + tempText
                    }
                })

            }

            //Add event to REPORT button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let reportButton = document.getElementById("report-btn-" + songsOnMainPage[i])
                reportButton.addEventListener('click', async function (e) {
                    e.preventDefault()

                    view.reportId = reportButton.parentNode.parentNode.parentNode.parentNode.id
                    let songInfoDoc = await firebase.firestore().collection("songs").doc(view.reportId).get()
                    let songInfo = transformDoc(songInfoDoc)
                    view.userReported = songInfo.creatorNickName
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songInfo.creator).get()
                    view.suspectId = ref.docs[0].id
                    view.songReported = songInfo.title
                    console.log(view.reportId)
                    console.log(view.userReported)
                    view.showComponent("report")
                })
            }

            //Add event to COMMENT button + a little update to css, controller and model
            for (let i = 0; i < songsOnMainPage.length; i++) {
                let commentButton = document.getElementById("comment-btn-" + songsOnMainPage[i])
                let commentsElement = commentButton.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("song-comments")[0]
                //Hover to see number of COMMENTS
                let parentId = commentButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)
                let comments = songDoc.comments
                commentButton.title = "Comments: " + songDoc.numComments
                //Button clicked
                commentButton.addEventListener('click', function (e) {
                    e.preventDefault()
                    if (commentsElement.style.display != 'block') {
                        commentsElement.style.display = 'block'
                    } else {
                        commentsElement.style.display = 'none'
                    }
                })
                //Show Comments
                view.showComments(parentId, comments)
                //CommentBar
                let formComment = commentsElement.getElementsByClassName("song-comment-bar")[0]
                formComment.onsubmit = formCommentSubmitHandler
                function formCommentSubmitHandler(e) {
                    e.preventDefault()
                    // get message content
                    let commentContent = e.target.comment.value.trim()
                    // update database
                    if (commentContent) {
                        controller.addComment(parentId, commentContent, nickName)
                    }
                }
                //----working---
            }

             //Add event to LOVE button
             for (i = 0; i < songsOnMainPage.length; i++) {
                let loveButton = document.getElementById("love-btn-" + songsOnMainPage[i])

                //Hover to see number of LIKES
                let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)

                loveButton.title = "Likes: " + songDoc.numLikes

                loveButton.addEventListener('click', async function (e) {
                    let likedYet = false
                    let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                    console.log(parentId)
                    let userEmail = await firebase.auth().currentUser.email
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", userEmail).get()

                    let doc = await firebase.firestore().collection("users").doc(ref.docs[0].id).get()
                    let userLove = transformDoc(doc)
      
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let likedBy = songDoc.likedBy

                    let refForCreator = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songDoc.creator).get()
                    let userLoveID = refForCreator.docs[0].id

                    for (i = 0; i < likedBy.length; i++) {
                        if (likedBy[i] == userEmail) {
                            likedYet = true
                        }
                    }
                    //UPDATE DOCUMENT
                    if (likedYet) {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayRemove(parentId),
                        })

                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(-1)
                        })
                        loveButton.style.background = 'red'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) - 1
                        loveButton.title = "Likes: " + num
                    }
                    else {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(parentId),
                        })

                        let loveNoti = "<span class='boldText'>" + userLove.nickName + "</span>" + " liked your song " + "<span class='boldText'>" + songDoc.title + "</span>"

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(userLoveID)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(loveNoti),
                            })


                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(1)
                        })
                        loveButton.style.background = 'purple'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) + 1
                        loveButton.title = "Likes: " + num
                    }

                })

            }

            //--------------FriendAccount---------
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()

            // --------------------------SIGNOUT-------------------------------
            let btnSignOut = document.getElementById("sign-out-btn")
            btnSignOut.onclick = signOut

            function signOut() {
                firebase.auth().signOut()
            }
            break
        }
        case 'follow': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let follows = user.follows
            console.log(follows)

            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.follow + component.dropDownMenu

            view.notificationDropHandler()

            let followingContainer = document.getElementById("following-container")
            followingContainer.innerHTML = ""

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName
            view.dropdownHandler()
            if (followingContainer) {
                for (i = 0; i < follows.length; i++) {
                    let tempId = follows[i]
                    console.log(tempId)
                    let userInfoDoc = await firebase.firestore().collection("users").doc(tempId).get()

                    let userInfo = transformDoc(userInfoDoc)
                    let nickName = userInfo.nickName

                    followingContainer.innerHTML += `
                <div class="followed-account" id="${tempId}">
                <div class="following-top">
                    <div class="following-box">
                        <div class="profile-name">${nickName}</div>
                        <div class="profile-image"></div>
                    </div>
                </div>
                <div class="profile-buttons">
                    <div class="profile-button-left">
                        <button class="profile-tracks" id="track-btn-${tempId}">TRACKS</button>
                    </div>
                    <div class="profile-button-right">
                        <button class="profile-following">SUBSCRIBED</button>
                    </div>
                </div>
            </div>
                `
                    if (userInfo.profileImage) {
                        let profileImage = document.getElementById(tempId).getElementsByClassName("profile-image")[0]
                        profileImage.style.background = `url('${userInfo.profileImage}') center center no-repeat`
                        profileImage.style.backgroundSize = 'cover'
                    }

                }
            }

            for (i = 0; i < follows.length; i++) {
                let tempId = follows[i]
                let trackButton = document.getElementById("track-btn-" + tempId)
                trackButton.addEventListener("click", async function () {
                    view.tempFriendId = tempId
                    // console.log(view.tempFriendId)
                    let doc = await firebase.firestore().collection("users").doc(tempId).get()
                    view.tempAccount = transformDoc(doc)
                    view.showComponent('friendAccount')
                })
            }

            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'upload': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            // ----------------------------DISPLAY & DROPDOWN------------------------
            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.upload + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            //Prevent clicking button to quick --> somehow auto-refresh
            document.getElementById("upload-song-btn").setAttribute("disabled", true)
            view.dropdownHandler()
            controller.uploadSong()
            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'profile': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)

            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.profile + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName
            view.dropdownHandler()

            //---------------profile----------------------
            //getUserName
            let profileName = document.getElementById("profile-name")
            let nickName = user.nickName
            let accLevel = user.accLevel

            profileName.innerHTML = nickName
            //track and bookmarks
            let profileTracks = document.getElementById("profile-tracks")
            let profileBookmarks = document.getElementById("profile-bookmarks")
            let adminPage = document.getElementById("admin-page")
            let profileImage = document.getElementById("profile-image")
            if (accLevel != "admin") {
                document.getElementById("admin-page").setAttribute("disabled", true)
                adminPage.style.background = "gray"
            }

            profileTracks.onclick = function () {
                view.showComponent('mySongs')
            }
            profileBookmarks.onclick = function () {
                view.showComponent('bookmark')
            }
            adminPage.onclick = function () {
                view.showComponent('adminPage')
            }
            if (user.profileImage) {
                profileImage.style.background = `url('${user.profileImage}') center center no-repeat`
                profileImage.style.backgroundSize = "cover"
            }
            controller.addProfileImage()
            view.navHandler()
            view.navSearchHandler()
            //admin page ---------------------------neu kip----------------------
            break
        }
        case 'friendAccount': {
            songsOnMainPage = []
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)

            let app = document.getElementById('app')
            app.innerHTML = component.friendAccount + component.nav + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName

            let subcribeButton = document.getElementById("subcribe-btn")
            let tempDoc = await firebase.firestore().collection("users").doc(view.tempFriendId).get()
            let tfTempDoc = transformDoc(tempDoc)
            let followedList = tfTempDoc.followedBy
            if (followedList) {
                if (followedList.includes(userID)) {
                    subcribeButton.style.background = "gray"
                    subcribeButton.innerText = "SUBCRIBED"
                }
            }
            view.dropdownHandler()
            //getAccountName
            let profileName = document.getElementById("profile-name")
            let nickName = view.tempAccount.nickName
            profileName.innerHTML = ''
            profileName.innerHTML += nickName
            //Account image
            if (tfTempDoc.profileImage) {
                let profileImage = document.getElementById("profile-image")
                profileImage.style.background = `url('${tfTempDoc.profileImage}') center center no-repeat`
                profileImage.style.backgroundSize = 'cover'
            }
            //tracks
            let songsContainer = document.getElementById("songs-container")
            console.log(view.tempAccount)
            for (i = 0; i < view.tempAccount.songsId.length; i++) {
                let tempEmail = await firebase.auth().currentUser.email

                let tempId = view.tempAccount.songsId[i]
                songsOnMainPage.push(tempId)
                console.log(tempId)
                let songInfoDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                let songInfo = transformDoc(songInfoDoc)

                let likedYetList = songInfo.likedBy

                let title = songInfo.title
                let creatorNickName = songInfo.creatorNickName
                let url = songInfo.url

                let imgUrl = songInfo.imgUrl
                songsContainer.innerHTML += `
                <div class="song-container" id = ${tempId}>
                <div class="song">
                    <div class="song-image" id="song-image-${tempId}"></div>
                    <div class="song-aside-right">
                        <div class="song-info">
                            <div class="song-info-detail">
                                <div class="song-name">${title}</div>
                                <div id="song-artist" class="song-artist">by ${creatorNickName}</div>
                            </div>
                            <button onclick="window.open('${url}')" class="btn-icon download-btn" name="download" id="download-btn-${tempId}"><i class="fas fa-arrow-down"></i></button>
                            <button class="btn-icon report-button" id="report-btn-${tempId}"><i class="fas fa-exclamation-circle"></i></button>
                        </div>
                        <div class="song-buttons">
                            <div class="audio-container">
                                <audio src="${url}" controls="controls" type="audio/mpeg" class="audio" id="play-btn-${tempId}"></audio>  
                            </div>
                            <button title = "numLikes"class="btn-icon love-button" id="love-btn-${tempId}"><i class="fas fa-heart"></i></button>
                            <button class="btn-icon comment-button" id="comment-btn-${tempId}"><i class="fas fa-comment-alt"></i></button>
                            <button class="btn-icon save-button" id="save-btn-${tempId}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <div class="song-comments">
                    <form class="song-comment-bar">
                        <div class="comment-input-container">
                            <input type="text" name="comment" placeholder="Write a comment">
                        </div>
                    </form>
                    <div class="song-comment-container">
                    </div>
                    <div class="song-view-more">show more comments</div>
                </div>
            </div>
                `
                //Change color of LOVE button when loading page (incomplete) (don't delete this)
                let loveButton = document.getElementById("love-btn-" + tempId)
                if (likedYetList.includes(tempEmail)) {
                    loveButton.style.background = "purple"
                }

                let imgLoader = document.getElementById("song-image-" + tempId)
                imgLoader.style.backgroundImage = `url('${imgUrl}')`

            }

            //Play one song, stop others
            for (i = 0; i < songsOnMainPage.length; i++) {
                let playButton = document.getElementById("play-btn-" + songsOnMainPage[i])
                if (playButton) {
                    playButton.addEventListener('play', async function (e) {
                        var audios = document.getElementsByTagName('audio');
                        for (var i = 0, len = audios.length; i < len; i++) {
                            if (audios[i] != e.target) {
                                audios[i].pause();
                            }
                        }
                    })
                }
            }

            //Add event to IMAGE
            for (i = 0; i < songsOnMainPage.length; i++) {
                let imgDiv = document.getElementById("song-image-" + songsOnMainPage[i])
                imgDiv.addEventListener('click', async function () {
                    if (imgDiv.style.background.includes("black")) {
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let imgUrl = song.imgUrl
                        imgDiv.style.background = "center center no-repeat"
                        imgDiv.style.backgroundSize = "cover"
                        imgDiv.style.backgroundImage = `url('${imgUrl}')`
                        imgDiv.style.backgroundColor = "aqua"
                        imgDiv.innerText = ""
                    }
                    else {
                        imgDiv.style.background = "black"
                        imgDiv.style.padding = "10px"
                        let tempId = imgDiv.parentNode.parentNode.id
                        let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                        let song = transformDoc(songDoc)
                        let genre = song.genre
                        let description = song.description
                        // let tempText = ""
                        imgDiv.innerText = "Description: " + description
                        splitText = imgDiv.innerText.split(" ")
                        numChar = []
                        for (i = 0; i < splitText.length; i++) {
                            numChar.push(splitText[i].length)
                        }
                        console.log(numChar)
                        let sumCheck = 0
                        tempText = ""
                        for (i = 0; i < numChar.length; i++) {
                            sumCheck += numChar[i]
                            if (sumCheck > 29) {
                                tempText += "\n" + splitText[i] + " "
                                sumCheck = numChar[i]
                            }
                            else {
                                tempText += splitText[i] + " "
                            }
                        }
                        imgDiv.innerText = "Genre: " + genre + "\n" + tempText
                    }
                })

            }

            //Add event to REPORT button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let reportButton = document.getElementById("report-btn-" + songsOnMainPage[i])
                reportButton.addEventListener('click', async function (e) {
                    e.preventDefault()

                    view.reportId = reportButton.parentNode.parentNode.parentNode.parentNode.id
                    let songInfoDoc = await firebase.firestore().collection("songs").doc(view.reportId).get()
                    let songInfo = transformDoc(songInfoDoc)
                    view.userReported = songInfo.creatorNickName
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songInfo.creator).get()
                    view.suspectId = ref.docs[0].id
                    view.songReported = songInfo.title
                    console.log(view.reportId)
                    console.log(view.userReported)
                    view.showComponent("report")
                })
            }

            //Add event to COMMENT button + a little update to css, controller and model
            for (let i = 0; i < songsOnMainPage.length; i++) {
                let commentButton = document.getElementById("comment-btn-" + songsOnMainPage[i])
                let commentsElement = commentButton.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("song-comments")[0]
                //Hover to see number of COMMENTS
                let parentId = commentButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)
                let comments = songDoc.comments
                commentButton.title = "Comments: " + songDoc.numComments
                //Button clicked
                commentButton.addEventListener('click', function (e) {
                    e.preventDefault()
                    if (commentsElement.style.display != 'block') {
                        commentsElement.style.display = 'block'
                    } else {
                        commentsElement.style.display = 'none'
                    }
                })
                //Show Comments
                view.showComments(parentId, comments)
                //CommentBar
                let formComment = commentsElement.getElementsByClassName("song-comment-bar")[0]
                formComment.onsubmit = formCommentSubmitHandler
                function formCommentSubmitHandler(e) {
                    e.preventDefault()
                    // get message content
                    let commentContent = e.target.comment.value.trim()
                    // update database
                    if (commentContent) {
                        controller.addComment(parentId, commentContent, nickName)
                    }
                }
                //----working---
            }

             //Add event to LOVE button
             for (i = 0; i < songsOnMainPage.length; i++) {
                let loveButton = document.getElementById("love-btn-" + songsOnMainPage[i])

                //Hover to see number of LIKES
                let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)

                loveButton.title = "Likes: " + songDoc.numLikes

                loveButton.addEventListener('click', async function (e) {
                    let likedYet = false
                    let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                    console.log(parentId)
                    let userEmail = await firebase.auth().currentUser.email
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", userEmail).get()

                    let doc = await firebase.firestore().collection("users").doc(ref.docs[0].id).get()
                    let userLove = transformDoc(doc)
      
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let likedBy = songDoc.likedBy

                    let refForCreator = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songDoc.creator).get()
                    let userLoveID = refForCreator.docs[0].id

                    for (i = 0; i < likedBy.length; i++) {
                        if (likedBy[i] == userEmail) {
                            likedYet = true
                        }
                    }
                    //UPDATE DOCUMENT
                    if (likedYet) {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayRemove(parentId),
                        })

                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(-1)
                        })
                        loveButton.style.background = 'red'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) - 1
                        loveButton.title = "Likes: " + num
                    }
                    else {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(parentId),
                        })

                        let loveNoti = "<span class='boldText'>" + userLove.nickName + "</span>" + " liked your song " + "<span class='boldText'>" + songDoc.title + "</span>"

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(userLoveID)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(loveNoti),
                            })


                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(1)
                        })
                        loveButton.style.background = 'purple'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) + 1
                        loveButton.title = "Likes: " + num
                    }

                })

            }


            //FOLLOW/SUBCRIBE feature
            if (subcribeButton) {
                console.log(view.tempFriendId)
                subcribeButton.addEventListener('click', async function (e) {
                    let subcribedYet = false
                    let tempDoc = await firebase.firestore().collection("users").doc(view.tempFriendId).get()
                    let tfTempDoc = transformDoc(tempDoc)
                    let followedList = tfTempDoc.followedBy
                    if (followedList) {
                        if (followedList.includes(userID)) {
                            subcribeButton.style.background = "gray"
                            subcribeButton.innerText = "SUBCRIBED"
                        }
                    }
                    if (followedList.includes(userID)) {
                        subcribedYet = true
                    }
                    console.log(view.tempFriendId)
                    if (subcribedYet) {
                        await firebase.firestore().collection("users").doc(view.tempFriendId).update({
                            followedBy: firebase.firestore.FieldValue.arrayRemove(userID),
                        })
                        await firebase.firestore().collection("users").doc(userID).update({
                            follows: firebase.firestore.FieldValue.arrayRemove(view.tempFriendId),
                        })

                        subcribeButton.style.background = "crimson"
                        subcribeButton.innerText = "SUBCRIBE"

                    }
                    else {
                        await firebase.firestore().collection("users").doc(view.tempFriendId).update({
                            followedBy: firebase.firestore.FieldValue.arrayUnion(userID),
                        })

                        let subNoti = "<span class='boldText'>" + user.nickName + "</span>" + " has followed you."
                        console.log(subNoti)

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(view.tempFriendId)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(subNoti),
                            })

                        await firebase.firestore().collection("users").doc(userID).update({
                            follows: firebase.firestore.FieldValue.arrayUnion(view.tempFriendId),
                        })

                        subcribeButton.style.background = "gray"
                        subcribeButton.innerText = "SUBCRIBED"
                    }
                })
            }
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()
            //(bugged - not needed - Manh's opinion - fixed)
            break
        }
        case 'aboutUS': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.aboutUS + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            let audioLoop = document.getElementById("hidden-audio")
            audioLoop.play()
            view.dropdownHandler()
            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'report': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.report + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            let reportTarget = document.getElementById("user-reported")
            reportTarget.innerHTML = "Regard User " + "<span class='redText'>" + view.userReported + "</span>" + " with Song " + "<span class='redText'>" + view.songReported + "</span>"
            view.dropdownHandler()
            controller.reportSong()
            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'feedback': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let app = document.getElementById('app')
            app.innerHTML = component.feedback + component.nav + component.dropDownMenu
            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName
            view.dropdownHandler()
            let feedbackForm = document.getElementById("form-feedback")
            let feedbackButton = document.getElementById("submit-feedback-btn")

            feedbackForm.onsubmit = feedbackSubmitHandler
            async function feedbackSubmitHandler(e) {
                e.preventDefault()
                feedbackButton.setAttribute("disabled", true)

                let ref = await firebase.firestore().
                    collection("users").
                    where("mail", "==", firebase.auth().currentUser.email).get()
                let userID = ref.docs[0].id
                let doc = await firebase.firestore().collection("users").doc(userID).get()
                let user = transformDoc(doc)
                let nickName = user.nickName

                let feedbackInfo = {
                    mainInfo: feedbackForm.feedbackInput.value,
                    feedbackUserId: userID,
                    feedbackUser: nickName
                }

                let adminDoc = await firebase.firestore().
                    collection("users").
                    where("accLevel", "==", "admin").get()
                // console.log(adminDoc.size)
                // console.log(adminDo)
                for (i = 0; i < adminDoc.size; i++) {
                    let adminID = adminDoc.docs[i].id
                    // console.log(adminID)
                    await firebase.firestore().collection("users").doc(adminID).update({
                        feedbackReceived: firebase.firestore.FieldValue.arrayUnion(feedbackInfo),
                    })
                }

                feedbackButton.removeAttribute("disabled")
                let navProfileText = document.getElementById("nav-profile").textContent
                app.innerHTML = component.nav + component.feedbackComplete + component.dropDownMenu
                document.getElementById("nav-profile").textContent = navProfileText
                view.dropdownHandler()
                view.navHandler()
                view.navSearchHandler()
            }
            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'adminPage': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            let app = document.getElementById('app')
            app.innerHTML = component.adminPage + component.nav + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            view.dropdownHandler()
            adminReport = document.getElementById("admin-report")
            adminFeedback = document.getElementById("admin-feedback")
            adminReport.onclick = function () {
                view.showComponent('adminReport')
            }
            adminFeedback.onclick = function () {
                view.showComponent('adminFeedback')
            }

            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'adminReport': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.adminReport + component.dropDownMenu

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName
            let reports = user.reportReceived

            let reportsContainer = document.getElementById("reports-container")
            reportsContainer.innerHTML = ""
            view.dropdownHandler()
            if (reports.length > 0) {
                for (i = reports.length - 1; i > -1; i--) {
                    let detectorDoc = await firebase.firestore().collection("users").doc(reports[i].detector).get()
                    let detector = transformDoc(detectorDoc)
                    let suspectDoc = await firebase.firestore().collection("users").doc(reports[i].suspect).get()
                    let suspect = transformDoc(suspectDoc)
                    reportsContainer.innerHTML += `
                <div class="report">
                <div class="report-info">
                    <h3>Report Ticket ${i + 1}</h3>
                    <div class="reporter">reported by ${detector.nickName}</div>
                    <div class="report-song">Song: ${reports[i].songName}</div>
                    <div class="report-song-creator">Creator: ${suspect.nickName}</div>
                    <div class="reason-report">Reason: ${reports[i].reason}</div>
                </div>
            </div>  
                `
                }
            }
            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'adminFeedback': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let app = document.getElementById('app')
            app.innerHTML = component.nav + component.adminFeedback + component.dropDownMenu

            view.notificationDropHandler()


            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = user.nickName

            let feedbacks = user.feedbackReceived

            let reportsContainer = document.getElementById("reports-container")
            reportsContainer.innerHTML = ""
            view.dropdownHandler()
            if (feedbacks.length > 0) {
                for (i = feedbacks.length - 1; i > -1; i--) {
                    let feedbackDoc = await firebase.firestore().collection("users").doc(feedbacks[i].feedbackUserId).get()
                    let feedback = transformDoc(feedbackDoc)
                    let content = "<span class='boldText'>" + "Content: " + "</span>" + feedbacks[i].mainInfo
                    splitText = content.split(" ")
                    numChar = []
                    for (k = 0; k < splitText.length; k++) {
                        numChar.push(splitText[k].length)
                    }
                    console.log(numChar)
                    let sumCheck = 0
                    tempText = ""
                    for (j = 0; j < numChar.length; j++) {
                        sumCheck += numChar[j]
                        if (sumCheck > 48) {
                            tempText += "\n" + splitText[j] + " "
                            sumCheck = numChar[j]
                        }
                        else {
                            tempText += splitText[j] + " "
                        }
                    }
                    content = tempText

                    reportsContainer.innerHTML += `
                <div class="report">
                <div class="report-info">
                    <h3>Feedback ${i + 1}</h3>
                    <div class="reporter">feedback by ${feedback.nickName}</div>
                    <div class="reason-report">${content}</div>
                </div>
            </div>  
                `
                }
            }

            view.navHandler()
            view.navSearchHandler()
            break
        }
        case 'search': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            let app = document.getElementById('app')
            app.innerHTML = component.search + component.dropDownMenu + component.nav

            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            view.dropdownHandler()
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()
            break
        }
        case 'songStation': {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName

            let app = document.getElementById('app')
            app.innerHTML = component.songStation + component.nav + component.dropDownMenu
            view.notificationDropHandler()

            let profileDisplay = document.getElementById("nav-profile")
            profileDisplay.textContent = nickName
            view.dropdownHandler()
            controller.songStation()
            view.navHandler()
            view.navSearchHandler()
            view.getAccessToFriendAccount()

            break

        }
    }
}
view.setText = function (id, text) {
    document.getElementById(id).innerText = text
}
view.validate = function (condition, idErrorTag, messageError) {
    if (condition) {
        view.setText(idErrorTag, '')
        return true
    } else {
        view.setText(idErrorTag, messageError)
        return false
    }
}
view.validateTest = function (conditionArray, idErrorTagArray, messageErrorArray, defaultMessageError) {
    if (conditionArray[0]) {
        view.setText(idErrorTagArray[0], defaultMessageError)
        if (conditionArray[1]) {
            if (conditionArray[2] && conditionArray[3]) {
                view.setText(idErrorTagArray[1], defaultMessageError)
                return true
            } else {
                view.setText(idErrorTagArray[1], messageErrorArray[2])
            }
        } else {
            view.setText(idErrorTagArray[0], messageErrorArray[0])
        }
        return false
    } else {
        if (conditionArray[2]) {
            view.setText(idErrorTagArray[0], messageErrorArray[1])
            view.setText(idErrorTagArray[1], messageErrorArray[2])
        } else {
            view.setText(idErrorTagArray[0], messageErrorArray[1])
        }
        return false
    }
}
function allPassed(validateResult) {
    for (let validate of validateResult) {
        if (!validate) {
            return false
        }
    }
    return true
}

function isPlaying(playerId) {
    var player = document.getElementById(playerId);
    return !player.paused && !player.ended && 0 < player.currentTime;
}

view.disable = function (id) {
    document.getElementById(id).setAttribute('disabled', true)
}
view.enable = function (id) {
    document.getElementById(id).removeAttribute('disabled')
}
view.navHandler = function () {
    logo = document.getElementById("logo")
    feedback = document.getElementById("feedback")
    homepage = document.getElementById("homepage")
    mySongs = document.getElementById("mySongs")
    bookmark = document.getElementById("bookmark")
    follow = document.getElementById("follow")
    upload = document.getElementById("nav-upload")
    profile = document.getElementById("nav-profile")
    aboutUS = document.getElementById("aboutUS")
    songStation = document.getElementById("songStation")


    songStation.onclick = function () {
        view.showComponent('songStation')
    }
    feedback.onclick = function () {
        view.showComponent('feedback')
    }
    logo.onclick = function () {
        view.showComponent('page')
    }
    homepage.onclick = function () {
        view.showComponent('page')
    }
    mySongs.onclick = function () {
        view.showComponent('mySongs')
    }
    bookmark.onclick = function () {
        view.showComponent('bookmark')
    }
    follow.onclick = function () {
        view.showComponent('follow')
    }
    upload.onclick = function () {
        view.showComponent('upload')
    }
    if (profile) {
        profile.onclick = function () {
            view.showComponent('profile')
        }
    }
    aboutUS.onclick = function () {
        view.showComponent('aboutUS')
    }
}
view.getNickName = async function () {
    let ref = await firebase.firestore().
        collection("users").
        where("mail", "==", firebase.auth().currentUser.email).get()
    let userID = ref.docs[0].id
    let doc = await firebase.firestore().collection("users").doc(userID).get()
    let user = transformDoc(doc)
    let nickName = user.nickName
    let profileDisplay = document.getElementById("nav-profile")
    profileDisplay.textContent = nickName
}

view.dropdownHandler = function () {
    let dropDownBtn = document.getElementById('more-information-btn')
    dropDownBtn.onclick = dropDownClickHandler
    let dropDownMenu = document.getElementById('more-information-menu')
    dropDownMenu.style.display = 'none'
    let isDropDown = false

    function dropDownClickHandler(event) {
        event.preventDefault()
        if (isDropDown == false) {
            isDropDown = true
            dropDownMenu.style.display = 'block'
        } else {
            isDropDown = false
            dropDownMenu.style.display = 'none'
        }
    }
    // signOutBtn
    let btnSignOut = document.getElementById("sign-out-btn")
    btnSignOut.onclick = signOut

    function signOut() {
        firebase.auth().signOut()
    }

}

view.notificationDropHandler = async function () {
    let notificationBtn = document.getElementById('notification-btn')
    notificationBtn.onclick = notificationClickHandler
    let notificationMenu = document.getElementById('notification-menu')
    notificationMenu.style.display = 'none'
    let notificationIsDropDown = false

    let ref = await firebase.firestore().
        collection("users").
        where("mail", "==", firebase.auth().currentUser.email).get()
    let userID = ref.docs[0].id
    let doc = await firebase.firestore().collection("users").doc(userID).get()
    let user = transformDoc(doc)
    let notifications = user.notifications

    async function notificationClickHandler(event) {
        event.preventDefault()

        let notificationList = document.getElementById('notificationList')
        if (notificationList.innerHTML) {
            notificationList.innerHTML = ""
        }

        let loopLim = 5
        if (notifications.length < 5) {
            loopLim = notifications.length
        }
        for (i = 0; i < loopLim; i++) {
            notificationList.innerHTML += `
            <div class="notification_item">${notifications[notifications.length - 1 - i]}</div>
            `
        }

        if (notificationIsDropDown == false) {
            notificationIsDropDown = true
            notificationMenu.style.display = 'block'
        } else {
            notificationIsDropDown = false
            notificationMenu.style.display = 'none'
        }
    }
    // signOutBtn
    let btnSignOut = document.getElementById("sign-out-btn")
    btnSignOut.onclick = signOut

    function signOut() {
        firebase.auth().signOut()
    }
}

view.navSearchHandler = function (songsOnMainPage) {

    let navSearch = document.getElementById("nav-search")
    navSearch.onsubmit = async function (event) {
        songsOnMainPage = []
        event.preventDefault()
        let searchInfo = event.target.search.value.trim()
        if (searchInfo) {
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let nickName = user.nickName
            // event.target.search.value = ''
            await view.showComponent('search')
            view.disable("btn-icon-search")

            let songsContainer = document.getElementById("songs-container")
            let songDoc = await firebase.firestore().collection("songs").orderBy("createdAt", "desc").get()
            songsContainer.innerHTML = ""
            for (i = 0; i < songDoc.docs.length; i++) {
                let tempEmail = await firebase.auth().currentUser.email

                let tempId = songDoc.docs[i].id
                let songInfoDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                let songInfo = transformDoc(songInfoDoc)

                let likedYetList = songInfo.likedBy

                let title = songInfo.title
                let creatorNickName = songInfo.creatorNickName
                let url = songInfo.url

                let imgUrl = songInfo.imgUrl
                if (title.includes(searchInfo) || creatorNickName.includes(searchInfo)) {
                    songsOnMainPage.push(tempId)
                    songsContainer.innerHTML += `
            <div class="song-container" id = ${tempId}>
            <div class="song">
                <div class="song-image" id="song-image-${tempId}"></div>
                <div class="song-aside-right">
                    <div class="song-info">
                        <div class="song-info-detail">
                            <div class="song-name">${title}</div>
                            <div class="song-artist">by ${creatorNickName}</div>
                        </div>
                        <button onclick="window.open('${url}')" class="btn-icon download-btn" name="download" id="download-btn-${tempId}"><i class="fas fa-arrow-down"></i></button>
                        <button class="btn-icon report-button" id="report-btn-${tempId}"><i class="fas fa-exclamation-circle"></i></button>
                    </div>
                    <div class="song-buttons">
                        <div class="audio-container">
                            <audio src="${url}" controls="controls" type="audio/mpeg" class="audio" id="play-btn-${tempId}"></audio>  
                        </div>
                        <button title="numLikes" class="btn-icon love-button" id="love-btn-${tempId}"><i class="fas fa-heart"></i></button>
                        <button class="btn-icon comment-button" id="comment-btn-${tempId}"><i class="fas fa-comment-alt"></i></button>
                        <button class="btn-icon save-button"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <div class="song-comments">
                <form class="song-comment-bar">
                    <div class="comment-input-container">
                        <input type="text" name="comment" placeholder="Write a comment">
                    </div>
                </form>
                <div class="song-comment-container">
                </div>
                <div class="song-view-more">show more comments</div>
            </div>
        </div>`

                    //Change color of LOVE button when loading page (incomplete) (don't delete this)
                    let loveButton = document.getElementById("love-btn-" + tempId)
                    if (likedYetList.includes(tempEmail)) {
                        loveButton.style.background = "purple"
                    }

                    let imgLoader = document.getElementById("song-image-" + tempId)
                    imgLoader.style.backgroundImage = `url('${imgUrl}')`
                }
            }
            if (songsContainer.innerHTML == "") {
                songsContainer.innerHTML = `
            <div class="search-no-result">No results</div>
            `
            }
            if (songsOnMainPage.length > 0) {
                for (i = 0; i < songsOnMainPage.length; i++) {
                    let imgDiv = document.getElementById("song-image-" + songsOnMainPage[i])
                    imgDiv.addEventListener('click', async function () {
                        if (imgDiv.style.background.includes("black")) {
                            let tempId = imgDiv.parentNode.parentNode.id
                            let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                            let song = transformDoc(songDoc)
                            let imgUrl = song.imgUrl
                            imgDiv.style.background = "center center no-repeat"
                            imgDiv.style.backgroundSize = "cover"
                            imgDiv.style.backgroundImage = `url('${imgUrl}')`
                            imgDiv.style.backgroundColor = "aqua"
                            imgDiv.innerText = ""
                        }
                        else {
                            imgDiv.style.background = "black"
                            imgDiv.style.padding = "10px"
                            let tempId = imgDiv.parentNode.parentNode.id
                            let songDoc = await firebase.firestore().collection("songs").doc(tempId).get()
                            let song = transformDoc(songDoc)
                            let genre = song.genre
                            let description = song.description
                            // let tempText = ""
                            imgDiv.innerText = "Description: " + description
                            splitText = imgDiv.innerText.split(" ")
                            numChar = []
                            for (i = 0; i < splitText.length; i++) {
                                numChar.push(splitText[i].length)
                            }
                            console.log(numChar)
                            let sumCheck = 0
                            tempText = ""
                            for (i = 0; i < numChar.length; i++) {
                                sumCheck += numChar[i]
                                if (sumCheck > 29) {
                                    tempText += "\n" + splitText[i] + " "
                                    sumCheck = numChar[i]
                                }
                                else {
                                    tempText += splitText[i] + " "
                                }
                            }
                            imgDiv.innerText = "Genre: " + genre + "\n" + tempText
                        }
                    })

                }

                //Add event to REPORT button
                for (i = 0; i < songsOnMainPage.length; i++) {
                    let reportButton = document.getElementById("report-btn-" + songsOnMainPage[i])
                    reportButton.addEventListener('click', async function (e) {
                        e.preventDefault()

                        view.reportId = reportButton.parentNode.parentNode.parentNode.parentNode.id
                        let songInfoDoc = await firebase.firestore().collection("songs").doc(view.reportId).get()
                        let songInfo = transformDoc(songInfoDoc)
                        view.userReported = songInfo.creatorNickName
                        let ref = await firebase.firestore().
                            collection("users").
                            where("mail", "==", songInfo.creator).get()
                        view.suspectId = ref.docs[0].id
                        view.songReported = songInfo.title
                        console.log(view.reportId)
                        console.log(view.userReported)
                        view.showComponent("report")
                    })
                }

                //Add event to COMMENT button + a little update to css, controller and model
                for (let i = 0; i < songsOnMainPage.length; i++) {
                    let commentButton = document.getElementById("comment-btn-" + songsOnMainPage[i])
                    let commentsElement = commentButton.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("song-comments")[0]
                    //Hover to see number of COMMENTS
                    let parentId = commentButton.parentNode.parentNode.parentNode.parentNode.id
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let comments = songDoc.comments
                    commentButton.title = "Comments: " + songDoc.numComments
                    //Button clicked
                    commentButton.addEventListener('click', function (e) {
                        e.preventDefault()
                        if (commentsElement.style.display != 'block') {
                            commentsElement.style.display = 'block'
                        } else {
                            commentsElement.style.display = 'none'
                        }
                    })
                    //Show Comments
                    view.showComments(parentId, comments)
                    //CommentBar
                    let formComment = commentsElement.getElementsByClassName("song-comment-bar")[0]
                    formComment.onsubmit = formCommentSubmitHandler
                    function formCommentSubmitHandler(e) {
                        e.preventDefault()
                        // get message content
                        let commentContent = e.target.comment.value.trim()
                        // update database
                        if (commentContent) {
                            controller.addComment(parentId, commentContent, nickName)
                        }
                    }
                    //----working---
                }

                 //Add event to LOVE button
            for (i = 0; i < songsOnMainPage.length; i++) {
                let loveButton = document.getElementById("love-btn-" + songsOnMainPage[i])

                //Hover to see number of LIKES
                let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                let songDoc = await transformDoc(dataGetter)

                loveButton.title = "Likes: " + songDoc.numLikes

                loveButton.addEventListener('click', async function (e) {
                    let likedYet = false
                    let parentId = loveButton.parentNode.parentNode.parentNode.parentNode.id
                    console.log(parentId)
                    let userEmail = await firebase.auth().currentUser.email
                    let ref = await firebase.firestore().
                        collection("users").
                        where("mail", "==", userEmail).get()

                    let doc = await firebase.firestore().collection("users").doc(ref.docs[0].id).get()
                    let userLove = transformDoc(doc)
      
                    let dataGetter = await firebase.firestore().collection("songs").doc(parentId).get()
                    let songDoc = await transformDoc(dataGetter)
                    let likedBy = songDoc.likedBy

                    let refForCreator = await firebase.firestore().
                        collection("users").
                        where("mail", "==", songDoc.creator).get()
                    let userLoveID = refForCreator.docs[0].id

                    for (i = 0; i < likedBy.length; i++) {
                        if (likedBy[i] == userEmail) {
                            likedYet = true
                        }
                    }
                    //UPDATE DOCUMENT
                    if (likedYet) {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayRemove(parentId),
                        })

                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(-1)
                        })
                        loveButton.style.background = 'red'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) - 1
                        loveButton.title = "Likes: " + num
                    }
                    else {

                        await firebase.firestore().collection("users").doc(ref.docs[0].id).update({
                            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(parentId),
                        })

                        let loveNoti = "<span class='boldText'>" + userLove.nickName + "</span>" + " liked your song " + "<span class='boldText'>" + songDoc.title + "</span>"

                        await firebase
                            .firestore()
                            .collection('users')
                            .doc(userLoveID)
                            .update({
                                notifications: firebase.firestore.FieldValue.arrayUnion(loveNoti),
                            })


                        await firebase.firestore().collection("songs").doc(parentId).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userEmail),
                            numLikes: firebase.firestore.FieldValue.increment(1)
                        })
                        loveButton.style.background = 'purple'

                        let num = parseInt(loveButton.title.replace("Likes: ", "")) + 1
                        loveButton.title = "Likes: " + num
                    }

                })

            }

                //NOW PLAYING feature & Play one song, stop others
                for (i = 0; i < songsOnMainPage.length; i++) {
                    let playButton = document.getElementById("play-btn-" + songsOnMainPage[i])
                    playButton.addEventListener('play', async function (e) {
                        var audios = document.getElementsByTagName('audio');
                        for (var i = 0, len = audios.length; i < len; i++) {
                            if (audios[i] != e.target) {
                                audios[i].pause();
                            }
                        }
                        let currentSongName = document.getElementById("current-song-name")
                        let currentSongArtist = document.getElementById("current-song-artist")
                        playingId = playButton.parentNode.parentNode.parentNode.parentNode.parentNode.id
                        let playingRef = await firebase.firestore().collection("songs").doc(playingId).get()
                        let playing = transformDoc(playingRef)
                        let songName = playing.title
                        let songCreator = playing.creatorNickName
                        console.log(songName)
                        console.log(songCreator)
                        currentSongName.innerText = ""
                        currentSongArtist.innerText = ""
                        currentSongName.innerText += songName
                        currentSongArtist.innerText += songCreator
                    })
                }

            }
            view.enable('btn-icon-search')
            view.getAccessToFriendAccount()
        }
    }

}
view.getAccessToFriendAccount = function () {
    let songArtistLink = document.getElementsByClassName('song-artist')
    // let ref = await firebase.firestore().
    //     collection("users").
    //     where("mail", "==", firebase.auth().currentUser.email).get()
    // let ownerID = ref.docs[0].id
    for (i = 0; i < songArtistLink.length; i++) {
        console.log(songArtistLink[i])
        songArtistLink[i].onclick = async function (e) {
            let userRef = await firebase.firestore().
                collection("users").
                where("nickName", "==", e.target.innerHTML.replace("by ", '')).get()
            let userID = userRef.docs[0].id
            view.tempFriendId = userID
            // console.log(view.tempFriendId)
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            view.tempAccount = transformDoc(doc)
            let tempCheckMail = view.tempAccount.mail
            if (tempCheckMail == firebase.auth().currentUser.email) {
                view.showComponent('profile')
            }
            else {
                view.showComponent('friendAccount')
            }
        }
    }
}
view.showComments = function (songId, comments) {
    let commentsContainer = document.getElementById(songId).getElementsByClassName("song-comment-container")[0]
    commentsContainer.innerHTML = ''
    let commentsFirstLoad = 2
    if (comments.length < commentsFirstLoad) { commentsFirstLoad = comments.length }
    if (comments) {
        for (let i = 0; i < commentsFirstLoad; i++) {
            commentsContainer.innerHTML += `
        <div class="song-comment">
        <div class="song-comment-content"><b>${comments[comments.length - 1 - i].ownerName}</b>: ${comments[comments.length - 1 - i].content}</div>
        </div>
        `
        }
    }
    let viewMore = document.getElementById(songId).getElementsByClassName("song-view-more")[0]
    if (comments.length > commentsFirstLoad) {
        viewMore.style.display = 'block'
        let viewState = false
        viewMore.addEventListener('click', function (e) {
            if (!viewState) {
                e.target.innerHTML = "hide " + (comments.length - commentsFirstLoad) + " comments"
                viewState = true
                for (let i = 0; i < comments.length - commentsFirstLoad; i++) {
                    commentsContainer.innerHTML += `
                <div class="song-comment">
                <div class="song-comment-content"><b>${comments[comments.length - 1 - i - commentsFirstLoad].ownerName}</b>: ${comments[comments.length - 1 - i - commentsFirstLoad].content}</div>
                </div>
                `
                }
            } else {
                e.target.innerHTML = "show more comments"
                viewState = false
                for (let i = 0; i < comments.length - commentsFirstLoad; i++) {
                    html = `
                <div class="song-comment">
                <div class="song-comment-content"><b>${comments[i].ownerName}</b>: ${comments[i].content}</div>
                </div>
                `
                    commentsContainer.innerHTML = commentsContainer.innerHTML.replace(html, '')
                }
            }
        }
        )
    }
}