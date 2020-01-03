const controller = {
    tempSongId: '',
    currentStationSong: {},
    currentStationCreator: {},
    currentStationSongId: {}
}

controller.register = async function (registerInfo) {
    let email = registerInfo.email
    let password = registerInfo.password
    let nickName = registerInfo.nickName
    let displayName = registerInfo.lastName + ' ' + registerInfo.firstName
    view.setText("register-error", "")
    view.setText("register-success", "")

    view.disable("register-submit-btn")
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
        await firebase.auth().currentUser.updateProfile({
            displayName: displayName
        })
        await firebase.auth().currentUser.sendEmailVerification()
        let newUser = {
            favoriteSongsId: [],
            mail: email,
            nickName: nickName,
            accLevel: "normal",
            numSongs: 0,
            songs: [],
            songsId: [],
            follows: [],
            followedBy: [],
            announcements: [],
            notifications:[],
            profileImage: '',
            profileImageName: '',
        }
        await firebase.firestore().collection("users").add(newUser)
        firebase.auth().signOut()
        view.setText("register-success", "An email verification has been sent to your email")
    } catch (err) {
        view.setText("register-error", err.message)
    }
    view.enable("register-submit-btn")
}

controller.login = async function (loginInfo) {
    let email = loginInfo.email
    let password = loginInfo.password
    view.setText("login-error", "")
    view.disable("login-submit-btn")
    try {
        console.log("comparing")
        let result = await firebase.auth().signInWithEmailAndPassword(email, password)
        console.log("done comparing")
        if (!result.user.emailVerified) {
            throw new Error("You must verify email")
        }
    }
    catch (err) {
        view.setText("login-error", err.message)
        view.enable("login-submit-btn")
    }
}

controller.uploadSong = function () {
    let uploadForm = document.getElementById("form-upload-song")
    let uploadFileButton = document.getElementById("uploadFileButton");

    if (uploadFileButton) {
        uploadFileButton.addEventListener("change", async function (e) {
            // console.log(app)
            //Prevent spamming button (part 1)
            document.getElementById("upload-song-btn").setAttribute("disabled", true)

            let haveYet = false;
            var file = e.target.files[0];

            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            let songs = user.songs

            //Check for duplicate songs
            for (i = 0; i < songs.length; i++) {
                if (songs[i].name == file.name) {
                    haveYet = true
                }
            }

            //Add music to storage if not duplicate
            if (haveYet == false) {
                let numSongs = user.numSongs
                let songIndex = numSongs
                var storageRef = await firebase.storage().ref(userID + "/" + songIndex + "/" + file.name);
                var task = storageRef.put(file);

                task.on("state_changed",
                    function progress(snapshot) {
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED:
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING:
                                console.log('Upload is running');
                                break;
                        }
                    },

                    function error(err) {

                    },

                    function complete() {
                        haveYet = true
                        task.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
                            //Up to storage completed
                            console.log("file available at", downloadURL)

                            //Initialize new song in collection("songs")                              
                            let newSong = {
                                createdAt: new Date().toISOString(),
                                imgUrl: "",
                                likedBy: [],
                                numLikes: 0,
                                creator: firebase.auth().currentUser.email,
                                creatorNickName: "",
                                url: downloadURL,
                                name: file.name,
                                title: "",
                                description: "",
                                genre: "",
                                comments: "",
                                numComments: 0,
                            }
                            await firebase.firestore().collection("songs").add(newSong)

                            //Get the new song ID
                            let songRef = await firebase.firestore().
                                collection("songs").
                                where("url", "==", downloadURL).get()
                            let songID = songRef.docs[0].id

                            //Update user's document (1st time)
                            await firebase.firestore().collection("users").doc(userID).update({
                                songsId: firebase.firestore.FieldValue.arrayUnion(songID)
                            })

                            //Enable button for submit
                            document.getElementById("upload-song-btn").removeAttribute("disabled")

                            //SUBMIT event occur
                            uploadForm.onsubmit = formUploadSubmitHandler

                            let doc = await firebase.firestore().collection("users").doc(userID).get()
                            let user = transformDoc(doc)
                            let nickName = user.nickName

                            let songsIds = user.songsId
                            let neededSongId = songsIds[songsIds.length - 1]
                            async function formUploadSubmitHandler() {
                                //Prevent spamming button (part 2)
                                document.getElementById("upload-song-btn").setAttribute("disabled", true)
                                event.preventDefault()
                                //Get info from keyboard
                                let uploadInfo = {
                                    title: uploadForm.songTitle.value,
                                    genre: uploadForm.songGenre.value,
                                    description: uploadForm.songDescription.value

                                }

                                //Last updated info about the new song
                                let newSongInfo = {
                                    numLikes: 0,
                                    createdAt: new Date().toISOString(),
                                    likedBy: [],
                                    creator: firebase.auth().currentUser.email,
                                    creatorNickName: nickName,
                                    url: downloadURL,
                                    name: file.name,
                                    title: uploadForm.songTitle.value,
                                    genre: uploadForm.songGenre.value,
                                    description: uploadForm.songDescription.value
                                }
                                console.log(uploadInfo)
                                //Update user's document (2nd time)
                                await firebase.firestore().collection("users").doc(userID).update({
                                    songs: firebase.firestore.FieldValue.arrayUnion(newSongInfo),
                                    numSongs: firebase.firestore.FieldValue.increment(1),
                                })

                                //Update document in collection("songs")
                                await firebase.firestore().collection("songs").doc(neededSongId).update({
                                    title: uploadForm.songTitle.value,
                                    genre: uploadForm.songGenre.value,
                                    description: uploadForm.songDescription.value,
                                    creatorNickName: nickName
                                })
                                //Update with followers
                                let followedBy = user.followedBy
                                for (let i = 0; i < followedBy.length; i++) {
                                    let followerId = followedBy[i]
                                    let announcementMessage = `
                                        ${user.nickName} has just released a new song: ${uploadForm.songTitle.value}  
                                      `
                                    await firebase.firestore().collection("users").doc(followerId).update({
                                        announcements: firebase.firestore.FieldValue.arrayUnion(announcementMessage)
                                    })
                                }

                                controller.tempSongId = neededSongId

                                let navProfileText = document.getElementById("nav-profile").textContent
                                app.innerHTML = component.nav + component.imgUpload + component.dropDownMenu
                                document.getElementById("nav-profile").textContent = navProfileText
                                view.dropdownHandler()
                                view.navHandler()
                                view.notificationDropHandler()

                                document.getElementById("upload-img-btn").setAttribute("disabled", true)
                                controller.imgUploader()
                            }


                        })



                    }

                )
            }


        })
    }
    else {
        console.log("no upload butt")
    }
}

controller.imgUploader = function () {
    view.navSearchHandler()

    let uploadImgButton = document.getElementById("uploadImgButton");

    if (uploadImgButton) {
        uploadImgButton.addEventListener("change", async function (e) {
            view.dropdownHandler()
            //Prevent spamming button (part 1)
            document.getElementById("upload-img-btn").removeAttribute("disabled")

            var file = e.target.files[0];

            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)

            let uploadImgForm = document.getElementById("form-upload-img")
            uploadImgForm.onsubmit = formUploadImgSubmitHandler
            //Add music to storage if not duplicate
            async function formUploadImgSubmitHandler(e) {
                e.preventDefault();
                document.getElementById("upload-img-btn").setAttribute("disabled", true)
                let numSongs = user.numSongs
                let songIndex = numSongs - 1
                var storageRef = await firebase.storage().ref(userID + "/" + songIndex + "/" + file.name);


                var task = storageRef.put(file);

                task.on("state_changed",
                    function progress(snapshot) {
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED:
                                console.log('imgUpload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING:
                                console.log('imgUpload is running');
                                break;
                        }
                    },

                    function error(err) {

                    },

                    function complete() {
                        haveYet = true
                        task.snapshot.ref.getDownloadURL().then(async function (imgDownloadURL) {
                            //Up to storage completed
                            console.log("file available at", imgDownloadURL)

                            //Prevent spamming button (part 2)
                            document.getElementById("upload-img-btn").setAttribute("disabled", true)
                            event.preventDefault()

                            //Update document in collection("songs") (2nd time)
                            await firebase.firestore().collection("songs").doc(controller.tempSongId).update({
                                imgUrl: imgDownloadURL
                            })

                            document.getElementById("upload-img-btn").setAttribute("disabled", true)
                            let navProfileText = document.getElementById("nav-profile").textContent
                            app.innerHTML = component.nav + component.completeUpload + component.dropDownMenu
                            document.getElementById("nav-profile").textContent = navProfileText

                            view.notificationDropHandler()
                            view.dropdownHandler()
                            view.navHandler()
                            view.navSearchHandler()
                        })
                    }
                )
            }
            view.navHandler()
            view.navSearchHandler()
        })
    }
    else {
        console.log("no upload butt")
    }
}


controller.reportSong = async function () {
    let ref = await firebase.firestore().
        collection("users").
        where("mail", "==", firebase.auth().currentUser.email).get()
    let userID = ref.docs[0].id

    let reportForm = document.getElementById("form-report")
    let reportArea = document.getElementById("report-input-area")
    let reportInfo = {
        detector: userID,
        reason: {},
        songId: view.reportId,
        songName: view.songReported,
        suspect: view.suspectId
    }
    console.log(reportInfo)

    reportForm.onsubmit = reportSubmitHandler
    async function reportSubmitHandler(e) {
        e.preventDefault()
        let radios = document.getElementsByName("choice");
        let checked = false;
        let userAnswer;

        for (i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                checked = true;
                userAnswer = radios[i].value;
            }
        }
        if (!checked) {
            alert("please select a choice");
            return;
        }
        else {
            if (userAnswer == "stealing") {
                reportInfo.reason = "Stealing Songs (plagiarism)"
            }
            if (userAnswer == "inappropriate") {
                reportInfo.reason = "Inappropriate Content"
            }
            if (userAnswer == "notSong") {
                reportInfo.reason = "Not actually a song"
            }
            if (userAnswer == "other") {
                reportInfo.reason = reportForm.reasonInput.value
            }
            document.getElementById("submit-report-btn").setAttribute("disabled", true)
        }
        let adminDoc = await firebase.firestore().
            collection("users").
            where("accLevel", "==", "admin").get()
        // console.log(adminDoc.size)
        for (i = 0; i < adminDoc.size; i++) {
            let adminID = adminDoc.docs[i].id
            // console.log(adminID)
            await firebase.firestore().collection("users").doc(adminID).update({
                reportReceived: firebase.firestore.FieldValue.arrayUnion(reportInfo),
            })
        }
        let navProfileText = document.getElementById("nav-profile").textContent
        app.innerHTML = component.nav + component.reportComplete + component.dropDownMenu
        document.getElementById('nav-profile').textContent = navProfileText

        view.notificationDropHandler()
        view.dropdownHandler()
        view.navHandler()
        view.navSearchHandler()
    }
}

controller.addComment = async function (songId, commentContent, nickName) {

    let docForId = await firebase.firestore().
        collection("users").
        where("mail", "==", firebase.auth().currentUser.email).get()
    let userID = docForId.docs[0].id
    let myDoc = await firebase.firestore().collection("users").doc(userID).get()
    let myData = transformDoc(myDoc)
    let myNickName = myData.nickName

    let comment = {
        content: commentContent,
        owner: firebase.auth().currentUser.email,
        ownerName: nickName,
        createdAt: new Date().toISOString(),
    }

    let refSong = await firebase.firestore().
        collection("songs").
        doc(songId).get()
    let cmtSong = transformDoc(refSong)
    let ref = await firebase.firestore().
        collection("users").
        where("mail", "==", cmtSong.creator).get()
    let userCmtID = ref.docs[0].id

    let cmtNoti ="<span class='boldText'>" + myNickName + "</span>" + " commented on your song " + "<span class='boldText'>" + cmtSong.title +"</span>"

    await firebase
        .firestore()
        .collection('users')
        .doc(userCmtID)
        .update({
            notifications: firebase.firestore.FieldValue.arrayUnion(cmtNoti),
        })

    await firebase
        .firestore()
        .collection('songs')
        .doc(songId)
        .update({
            comments: firebase.firestore.FieldValue.arrayUnion(comment),
            numComments: firebase.firestore.FieldValue.increment(1)
        })
    document.getElementById(songId).getElementsByTagName("input")[0].value = ''
    let commentsContainer = document.getElementById(songId).getElementsByClassName("song-comment-container")[0]
    commentsContainer.innerHTML =
        `<div class="song-comment">
    <div class="song-comment-content"><b>${nickName}</b>: ${commentContent}</div>
    </div>` + commentsContainer.innerHTML

    let commentBtn = document.getElementById("comment-btn-" + songId)
    let title = parseInt(commentBtn.title.replace("Comments: ", ''))
    commentBtn.title = "Comments: " + (title + 1)
}

controller.songStation = async function () {
    let feelButton = document.getElementById("feel-btn")
    let unveilButton = document.getElementById("unveil-btn")
    let eternalizeButton = document.getElementById("eternalize-btn")
    let stationAudio = document.getElementById("station-audio")
    let lockImg = document.getElementById("lock-img")
    let unveilSong = document.getElementById("song-unveil-text")
    let unveilCreator = document.getElementById("creator-unveil-text")
    let isLocked = true

    feelButton.onclick = async function () {
        if (stationAudio.currentTime == 0) {
            let songDocs = await firebase.firestore().collection("songs").get()
            console.log(songDocs.size)
            let max = songDocs.size - 1
            let min = 0
            let randomNum = parseInt((Math.random() * (max - min + 1)), 10) + min
            console.log(randomNum)
            let tempRandId = songDocs.docs[randomNum].id

            controller.currentStationSongId = tempRandId

            let randDoc = await firebase.firestore().collection("songs").doc(tempRandId).get()
            let randSong = transformDoc(randDoc)

            controller.currentStationSong = randSong.title
            controller.currentStationCreator = randSong.creatorNickName

            isLocked = true

            let url = randSong.url
            stationAudio.src = url
            stationAudio.play()
        }
        if (stationAudio.paused) {
            stationAudio.play()
        }
    }
    unveilButton.onclick = async function () {
        if (stationAudio.currentTime > 0) {
            stationAudio.pause()
            if (isLocked) {
                lockImg.style.display = "none"
                unveilSong.style.display = "block"
                unveilCreator.style.display = "block"
                unveilSong.innerText = ""
                unveilCreator.innerText = ""
                unveilSong.innerText = "Song: " + controller.currentStationSong
                unveilCreator.innerText = "Creator: " + controller.currentStationCreator
                isLocked = false
            }
        }

    }


    eternalizeButton.onclick = async function () {
        let ref = await firebase.firestore().
            collection("users").
            where("mail", "==", firebase.auth().currentUser.email).get()
        let userID = ref.docs[0].id
        await firebase.firestore().collection("users").doc(userID).update({
            favoriteSongsId: firebase.firestore.FieldValue.arrayUnion(controller.currentStationSongId)
        })
        eternalizeButton.getAttribute("disabled", true)
    }

    stationAudio.addEventListener('ended', async function () {
        eternalizeButton.removeAttribute("disabled")

        isLocked = true
        lockImg.style.display = "block"
        unveilSong.innerText = ""
        unveilCreator.innerText = ""
        unveilSong.style.display = "none"
        unveilCreator.style.display = "none"

        let songDocs = await firebase.firestore().collection("songs").get()
        console.log(songDocs.size)
        let max = songDocs.size - 1
        let min = 0
        let randomNum = parseInt((Math.random() * (max - min + 1)), 10) + min
        console.log(randomNum)
        let tempRandId = songDocs.docs[randomNum].id

        controller.currentStationSongId = tempRandId

        let randDoc = await firebase.firestore().collection("songs").doc(tempRandId).get()
        let randSong = transformDoc(randDoc)

        controller.currentStationSong = randSong.title
        controller.currentStationCreator = randSong.creatorNickName

        let url = randSong.url
        stationAudio.src = url
        stationAudio.play()
    })

}
controller.addProfileImage = function () {
    let uploadImageButton = document.getElementById("upload-profile-image")
    let profileImage = document.getElementById("profile-image")
    if (uploadImageButton) {
        uploadImageButton.addEventListener("change", async function (e) {
            document.getElementById("upload-profile-image").setAttribute("disabled", true)
            var file = e.target.files[0]
            let ref = await firebase.firestore().
                collection("users").
                where("mail", "==", firebase.auth().currentUser.email).get()
            let userID = ref.docs[0].id
            let doc = await firebase.firestore().collection("users").doc(userID).get()
            let user = transformDoc(doc)
            if (user.profileImage) {
                var previousRef = await firebase.storage().ref(userID + "/" + user.profileImageName)
                previousRef.delete()
                await firebase.firestore().collection("users").doc(userID).update({
                    profileImage: '',
                    profileImageName: ''
                })
            }
            var storageRef = await firebase.storage().ref(userID + "/" + file.name)
            var task = storageRef.put(file)
            task.on("state_changed",
                function progress(snapshot) {
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED:
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING:
                            console.log('Upload is running');
                            break;
                    }
                },

                function error(err) {

                },

                function complete() {
                    task.snapshot.ref.getDownloadURL().then(async function (imgDownloadURL) {
                        //Up to storage completed
                        console.log("file available at", imgDownloadURL)

                        //Prevent spamming button (part 2)
                        document.getElementById("upload-profile-image").setAttribute("disabled", true)
                        event.preventDefault()

                        //Update document in collection("songs") (2nd time)
                        await firebase.firestore().collection("users").doc(userID).update({
                            profileImage: imgDownloadURL,
                            profileImageName: file.name
                        })
                        document.getElementById("upload-profile-image").removeAttribute("disabled")
                        profileImage.style.background = `url('${imgDownloadURL}') center center no-repeat`
                        profileImage.style.backgroundSize = 'cover'
                    })
                }
            )

        })
    }
}


function transformDoc(firestoreDoc) {
    let data = firestoreDoc.data()
    data.id = firestoreDoc.id

    return data
}