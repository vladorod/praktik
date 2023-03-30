document.addEventListener('DOMContentLoaded', async () => {

    const firebaseConfig = {
        apiKey: "AIzaSyAue2R_rOU1Up45pZgsSVGXnLzC4Ypj28o",
        authDomain: "praktik-2f40b.firebaseapp.com",
        projectId: "praktik-2f40b",
        storageBucket: "praktik-2f40b.appspot.com",
        messagingSenderId: "168645872906",
        appId: "1:168645872906:web:99ee3dadfc821fa6137ef3",
        measurementId: "G-838H8QQCMH"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();


    const Room = {
        isOccupied: async () => {
            let occupied = false;
            const room = await db.collection("room").get();
            room.forEach((doc) => {
                occupied = doc.data().occupied;
            });
            return occupied;
        },
        setOccupied: async (occupied = false) => {
            await db.collection("room").doc('wRpDZ8eao8Cz1zaMuRK4').update({occupied})
        },
        getTime: async () => {
            let time = '';
            const room = await db.collection("room").get();
            room.forEach((doc) => {
                time = doc.data().time;
            });
            return time;
        },
        setTime: async (time = '') => {
            await db.collection("room").doc('wRpDZ8eao8Cz1zaMuRK4').update({time})
        },
        getGuests: async () => {
            let guests = 0;
            const room = await db.collection("room").get();
            room.forEach((doc) => {
                guests = doc.data().guests;
            });
            return guests;
        },
        setGuests: async (guests) => {
            await db.collection("room").doc('wRpDZ8eao8Cz1zaMuRK4').update({guests})
        },
        listener: async (callback = () => {}) => {
            const room = await db.collection("room");
            room.onSnapshot((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    callback(doc.data());
                });

            });
        }
    };
    window.room = Room;

    const guests = await Room.getGuests() + 1;


    await Room.setGuests(guests);
    let isYouHost = guests === 1;


    const seanceLength = 25; // Задаём длину сеанса в минутах
    let timeSec = seanceLength * 60;



    window.onload = function () {
        document.getElementById('timer').innerHTML = seanceLength + ':00';
    }

    $('#start').on('touchstart click', function () {
        if (isYouHost) {
            startTimer()
        }

    });

    $('#stop').on('touchstart click', function () {
        if (isYouHost) {
            resetTimer()
        }

    });

    function startTimer() {
        Room.setOccupied(true);
        timer = setInterval(tickTimer, 1000);
    }

    function tickTimer() {
        let seconds = timeSec % 60;
        let minutes = Math.trunc(timeSec / 60 % 60);
        if (timeSec > 0) {
            setTime(minutes, seconds)
        } else {
            resetTimer();
        }
        --timeSec;
    }

    function setTime (minutes = 25, seconds = 0) {
        if (isYouHost) {
            if (seconds <= 9) {
                Room.setTime(`${minutes}:0${seconds}`)
            } else {
                Room.setTime(`${minutes}:${seconds}`)
            }
        }

    }

    const stopTimerView = () => {
            $('body').removeClass('busy');
            $('#stop').css('display', 'none');
            $('#start').css('display', 'flex');
    }

    const startTimerView = () => {
            $('body').addClass('busy');
            $('#stop').css('display', 'flex');
            $('#start').css('display', 'none');
    }



    function resetTimer() {
        Room.setOccupied(false);
        timer && clearInterval(timer);
        timeSec = seanceLength * 60;
        setTime();
    }

    Room.listener(({occupied}) => {
        const isBusy = timer.textContent !== '25:00';
        if (occupied && !isBusy) {
            startTimer()
        }
        if (!occupied && isBusy) {
            resetTimer()
        }
    })


    window.addEventListener('beforeunload', async (event) => {
        event.preventDefault();
        event.returnValue = '';
        const guests = await Room.getGuests();
        if (guests !== 0) {
            await Room.setGuests(guests - 1);
        } else {
            resetTimer()
        }

    });

    Room.listener(({time = '25:00'}) => {
        document.getElementById('timer').innerHTML = time;
    })

    Room.listener(({occupied = false}) => {
        if (occupied) {
            startTimerView();
        } else {
            stopTimerView()
        }
    })



    Room.listener(({guests, time}) => {
        if (guests === 1) {
            isYouHost = true;
        }
        if (guests === 0) {
            resetTimer();
        }

        document.getElementById('timer').innerHTML = time;
    })


})
