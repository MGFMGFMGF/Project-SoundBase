const component = {}
component.register = `
<section class="register-container">
    <form id = "register-form" class="register-form">
      <div class="form-header">
        <h3 id="form-header-h3">SoundBase</h3>
      </div>
      <div class="form-content">
        <div class="name-wrapper">
          <div class="input-wrapper">
            <input type="text" name="firstName" placeholder="First name">
            <div id = "firstname-error" class = "message-error">

            </div>
          </div>
          <div class="input-wrapper">
            <input type="text" name="lastName" placeholder="Last name">
            <div id = "lastname-error" class = "message-error">
                
            </div>
          </div>
          <div class="input-wrapper">
            <input type="text" name="nickName" placeholder="Nick name">
          </div>
        </div>
        <div class="email-wrapper">
          <div class="input-wrapper">
            <input type="email" name="email" placeholder="Email">
            <div id = "email-error" class = "message-error">

            </div>
          </div>
        </div>
        <div class="Password">
          <div class="input-wrapper">
            <input type="password" name="password" placeholder="Password">
            <div id = "password-error" class = "message-error">

            </div>
          </div>
          <div class="input-wrapper">
            <input type="password" name="confirmPassword" placeholder="Confirm Password">
            <div id = "confirmPassword-error" class = "message-error">

            </div>
          </div>
        <div id = "register-error" class = "message-error"></div>
        <div id = "register-success" class = "message-success"></div>
      </div>
      <div class="form-footer">
        <a id = "login-link" href="#">Already have an account? Login</a>
        <button id = "register-submit-btn" type="submit">Register</button>
      </div>
    </form>
  </section>`




component.login = `
<section class="login-container">
<form id = "login-form" class="login-form">
  <div class="form-header">
    <h3 id="form-header-h3">SoundBase</h3>
  </div>
  <div class="form-content">
    <div class="email-wrapper">
      <div class="input-wrapper">
        <input type="email" name="email" placeholder="Email">
        <div id = "email-error" class = "message-error">

        </div>
      </div>
    </div>
    <div class="Password">
      <div class="input-wrapper">
        <input type="password" name="password" placeholder="Password">
        <div id = "password-error" class = "message-error">
        </div>
        <div id = "login-error" class  = "message-error"> </div>
      </div>
    </div>
  <div class="form-footer">
    <a id = "register-link" href="#">Not yet have an account? Register</a>
    <button id = "login-submit-btn" type="submit">Login</button>
  </div>
</form>
</section>`
component.loading = `
<div class="loading-container">
    <img src= "https://i.pinimg.com/originals/12/6c/a6/126ca6bcc2616e4edf09f466e9925396.gif" alt="Loading"/>
</div>
`
component.nav = `
<nav class="main-nav">
    <div class="nav-container">
        <div class="notification-btn">
            <button class="btn-icon" id="notification-btn"><i class="far fa-bell"></i></button>
        </div>
        <div class="nav-left">
            <a class="logo" id="logo"></a>
            <div class="nav-left-menu">
                    <a class="page" id="homepage">HOME</a>
                    <a class="page" id="mySongs">MY SONGS</a>
                    <a class="page" id="bookmark">BOOKMARK</a>
                    <a class="page" id="follow">FOLLOW</a>
            </div>
        </div>
        <div class="nav-middle">
            <form id="nav-search"class="nav-search">
                <input class="nav-search-bar" type="search" placeholder="Search" name="search">
                <button type="submit" id="btn-icon-search" class='btn-icon'><i class="fas fa-search"></i></button>
            </form>
        </div>
        <div class="nav-right">
            <a class="upload-btn" id="nav-upload">UPLOAD</a>
            <a class="user-name" id="nav-profile"></a>
            <div class="more-information-btn">
                <button class="btn-icon" id="more-information-btn"><i class="fas fa-ellipsis-h"></i></button>
            </div>
        </div>
    </div>
</nav>
`
component.dropDownMenu = `
<div class="more-information-menu" id="more-information-menu">
    <div class="profileMenu">
        <div class="profileMenu_item" id="aboutUS">About us</div>
        <div class="profileMenu_item" id="feedback">Feedback</div>
        <div class="profileMenu_item" id="songStation">Song Station (Beta)</div>
        <div class="profileMenu_item" id="sign-out-btn">Sign Out</div>
    </div>
</div>
<div class="notification-menu" id="notification-menu">
        <div class="notificationList" id="notificationList">
        </div>
</div>
`

component.homepage = `
<section class="home">
    <div class="home-main">
        <div class="home-main-top">
            <div class="announcement-container">
                <div class="announcement-tag">Announcement</div>
                <div class="announcement-list" >
                    <ul id="announcement-list">
                </ul>
                </div>
            </div>
            <div class="current-song">
                <div class="current-song-tag">Now playing</div>
                <div class="current-song-display">
                    <div class="current-song-image" id="current-song-image"></div>
                    <div class="current-song-detail">
                        <div class="current-song-name" id="current-song-name">Song name</div>
                        <div class="current-song-artist" id="current-song-artist">by artist name</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="home-main-container">
            <div class="songs-container" id="songs-container">   
            </div>
            <div class="home-aside-right">
                <div class="leaderboard">
                    <div class="leaderboard-tag">Leaderboard</div>
                    <div class="leaderboard-list">
                        <div class="leaderboard-header">
                            <div class="leaderboard-artists-tag">Artists</div>
                            <div class="leaderboard-tracks-tag">Tracks</div>
                        </div>
                        <div class="leaderboard-content" id= "leaderboard-content">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`
component.mySongs = `
<section class="home">
    <div class="home-main">
        <div class="home-main-top not-home">

        </div>
        <div class="home-main-container">
            <div class="songs-container" id="songs-container">
            </div>
        </div>
    </div>
</section>
`
component.bookmark = `
<section class="home">
    <div class="home-main">
        <div class="home-main-top not-home">

        </div>
        <div class="home-main-container">
            <div class="songs-container" id="songs-container">
            </div>
        </div>
    </div>
</section>
`
component.follow = `
<section class="following">
    <div class="following-container" id="following-container">    
    <div>
</section>
`
component.upload = `
<section class="upload">
    <form class="form-upload-song" id="form-upload-song">
        <section class="upload-song">
            <div class="upload-song-text">Choose a song to upload</div>
            <input type="file" name="upload-song-file" id="uploadFileButton">
        </section>
        <section class="song-info">
            <div class="song-info-container">
                <div class="title-container">
                    <div class="title-text">Song title</div>
                    <input type="text" placeholder="Song title" name="songTitle">
                </div>
                <div class="genre-container">
                    <div class="genre-text">Genre</div>
                    <input type="text" placeholder="Genre" name="songGenre">
                </div>
                <div class="description-container">
                    <div class="description-text">Description</div>
                    <input type="text" placeholder="Description" name="songDescription">
                </div>
            </div>
        </section>
        <button type="submit" class='btn-icon' id="upload-song-btn"><i class="fas fa-paper-plane"></i></button>
    </form>
</section>
`

component.imgUpload = `
<section class="upload">
    <form class="form-upload-img" id="form-upload-img">
        <section class="upload-img">
            <div class="upload-img-text">Upload successfully. Choose an image for your song</div>
            <input type="file" name="upload-img-file" id="uploadImgButton">
        </section>
        <button type="submit" class='btn-icon' id="upload-img-btn"><i class="fas fa-paper-plane"></i></button>
    </form>
</section>
`

component.reportComplete = `
<section class="upload">
    <form class="form-upload-img">
        <section class="upload-img">
            <div class="upload-img-text">Report Complete! Continue to enjoy SoundBase</div>
        </section>
    </form>
</section>
`

component.report = `
<section class="upload">
        <form class="form-report" id="form-report">
            <section class="upload-song">
                <div class="report-title">Report Ticket</div>
                <div id="user-reported">Regard User XXX with Song YYY</div>
            </section>
            <section class="song-info">
                <div class="song-info-container">
                    <div class="sample-reasons">
                        <div>
                            <input class="report-input" type="radio" name="choice" value="stealing"> Stealing Songs (plagiarism)
                        </div>
                        <div>
                            <input class="report-input" type="radio" name="choice" value="inappropriate"> Inappropriate Content
                        </div>
                        <div>
                            <input class="report-input" type="radio" name="choice" value="notSong"> Not actually a song
                        </div>
                    </div>
                    <div class="reason-container">
                        <div> 
                            <input class="report-input" type="radio" name="choice" value="other"> Other reasons to Report:
                        </div>
                        <textarea name="reasonInput" id="report-input-area" rows="3" cols="60">Enter Text Here </textarea>
                    </div>
                </div>
            </section>
            <button type="submit" class='btn-icon' id="submit-report-btn"><i class="fas fa-paper-plane"></i></button>
        </form>
    </section>
`

component.completeUpload = `
<section class="upload">
    <form class="form-upload-img">
        <section class="upload-img">
            <div class="upload-img-text">Upload Complete! Continue to enjoy SoundBase</div>
        </section>
    </form>
</section>
`

component.profile = `
<section class="profile">
    <div class="profile-container">
        <div class="profile-top">
            <div class="profile-box">
                <div class="profile-name" id="profile-name">CheeseCloud</div>
                <div class="profile-image" id="profile-image">
                <input type="file" id="upload-profile-image" class="upload-profile-image">
                <label for="upload-profile-image">Change image</label>
                </div>
            </div>
        </div>
        <div class="profile-buttons">
            <div class="profile-button-left">
                <button class="profile-tracks" id="profile-tracks">TRACKS</button>
                <button class="profile-bookmarks" id="profile-bookmarks">BOOKMARKS</button>
            </div>
            <div class="profile-button-right">
                <button class="profile-following" id="admin-page">ADMIN PAGE</button>
            </div>
        </div>
    <div>
</section>
`
component.aboutUS = `
<section class="aboutUS">
    <div class="aboutUS-container">
        <div class="aboutUS-header">
            <div class="aboutUS-name">
                <div class="team-name">
                    SOUNDBASE'S DEVELOPERS
                </div>
                <div class="social-link">
                    <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/MindX.School/" class="btn-icon" id="facebook">
                        <i class="fab fa-facebook-square icon-large"></i>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://mindx.edu.vn/" class="btn-icon" id="website">
                        <i class="fas fa-globe-americas"></i>
                    </a>

                </div>
            </div>
        </div>
        <div class="aboutUS-content">
            <!-- <div class="aboutUS-video"> -->
                <!-- The video -->
                <!-- <video autoplay muted loop id="myVideo">
                    <source src="../SoundBaseProject/testArt/Guitar - 2661.mp4" type="video/mp4">
                </video> -->
                <!-- sound -->
                <!-- <audio controls autoplay>
                    <source src="../SoundBaseProject/testArt/Acoustic Guitar - sound test.flac" type="audio/flac">
                </audio> -->
                <!-- Text -->
                <!-- TODO: wrap to div -->
            <!-- </div> -->
            <div class="image">
                <img id="image" src="../SoundBase/testArt/aboutUS.jpg" alt="MindX">
                <audio controls loop id="hidden-audio">
                    <source src="../SoundBase/testArt/Latency - Martin Garrix_ Dyro [128kbps_MP3].mp3" type="audio/mpeg">
                </audio>
            </div>
            <div class="intro-text">
                <p id="welcome">Welcome to SoundBase,</p>
                <p id="body-text">
                    We are delighted to introduce you SoundBase. 
                    SoundBase is a platform for talented independent artists
                    to share their music to the world. 
                    Developed by young students of MindX,
                    SoundBase aims to transform the habit of music sharing 
                    by making it convenient and easy to access.
                    With just a click, your personal songs will be shared on our platform, ready
                    to be heard among millions of users. We continuously update SoundBase
                    leaderboard. 10 artists with highest contributions will receive honor
                    gifts from the developers. Be ready because the prize is going to be ENORMOUS.
                </p>
                <p id="end-text">“Music gives a soul to the universe, wings to the mind, flight to the imagination and life to everything.” 
                - Plato</p>
                <p id="signature">SoundBase Developers</p>
                <p id="sign-name">SoundBase, Inc. Vietnam</p>
            </div>
        </div>
    <div>
</section>
`
component.friendAccount = `
<section class="profile">
    <div class="profile-container">
        <div class="profile-top">
            <div class="profile-box">
                <div class="profile-name" id="profile-name">Amazing</div>
                <div class="profile-image" id='profile-image'></div>
            </div>
        </div>
        <div class="profile-buttons">
            <div class="profile-button-left">
                <button class="profile-tracks">TRACKS</button>
            </div>
            <div class="profile-button-right">
                <button class="profile-following" id="subcribe-btn">SUBSCRIBE</button>
            </div>
        </div>
        <div class="songs-container" id="songs-container"></div>
    <div>
</section>
`

component.adminPage =`
<section class="home" id="section-for-admin" >
        <div class="admin-buttons">
            <button class="admin-btn-report admin-eff" id="admin-report">Report Section </button>
            <button class="admin-btn-feedback admin-eff" id="admin-feedback">Feedback Section</button>
        </div>
    </section>
`

component.adminReport =`
<section class="home">
<div class="home-main">
    <div class="home-main-container">
        <div class="reports-container" >
            <div class="report-container" id="reports-container">   
            </div>
        </div>
    </div>
</div>
</section>
`

component.adminFeedback=`
<section class="home">
<div class="home-main">
    <div class="home-main-container">
        <div class="reports-container" >
            <div class="report-container" id="reports-container">   
            </div>
        </div>
    </div>
</div>
</section>
`

component.search = `
<section class="home">
<div class="home-main">
    <div class="home-main-top not-home">
    </div>
    <div class="home-main-container not-home-container">
        <div class="songs-container" id="songs-container">   
        </div> 
    </div>
</div>
</section>
`

component.feedbackComplete = `
<section class="upload">
    <form class="form-upload-img">
        <section class="upload-img">
            <div class="upload-img-text">Feedback sent!!! Thanks for your help!</div>
        </section>
    </form>
</section>
`

component.feedback = `
<section class="upload" id="only-for-feedback">
        <form class="form-report" id="form-feedback">
            <section class="upload-song">
                <div class="report-title">Feedback Section</div>
            </section>
            <section class="song-info">
                <div class="song-info-container">
                    <div class="feedback-container">
                        <textarea name="feedbackInput" id="report-input-area" rows="20" cols="60">Enter Text Here </textarea>
                    </div>
                </div>
            </section>
            <button type="submit" class='btn-icon' id="submit-feedback-btn"><i class="fas fa-paper-plane"></i></button>
        </form>
    </section>
`

component.songStation = `
<section class="home" id="section-for-station">
        <div class="home-main">
            <div class="home-main-container" id="home-for-station">
                <div class="song-station-main">
                    <div class="song-station-buttons">
                        <button class="station-btn" id="feel-btn"><span>FEEL</span></button>
                        <button class="station-btn" id="unveil-btn"><span>UNVEIL</span></button>
                        <button class="station-btn" id="eternalize-btn"><span>ETERNALIZE</span></button>
                    </div>
                    <div class="unveil-info" >
                        <div class="audio-container hidden-station-audio">
                            <audio src="" controls="controls" type="audio/mpeg" class="audio" id="station-audio"></audio>  
                        </div>
                        <div class="icon-lock" style="clear: center; float: center" id="lock-img">
                            <div class="lock-top-1" style="background-color: #2CC3B5"></div>
                            <div class="lock-top-2"></div>
                            <div class="lock-body" style="background-color: #2CC3B5"></div>
                            <div class="lock-hole"></div>
                          </div>
                        <div class="hidden-unveil-text" id="creator-unveil-text">Creator: XXX</div>
                        <div class="hidden-unveil-text" id="song-unveil-text">Song: YYY</div>
                    </div>
                </div>
                <div class="song-station-aside-right">
                    <div class="leaderboard">
                        <div class="guide-title">Swift Guide</div>
                        <div class="guide-text">
                            press <span class='specialFont'>FEEL</span> to enjoy melodies of random songs on our site.<br>
                            press <span class='specialFont'>UNVEIL</span> to reveal the current song' name and its creator. <br>
                            press <span class='specialFont'>ETERNALIZE</span> to add to your songs collection Bookmark. <br>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`


