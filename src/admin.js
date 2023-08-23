const access = localStorage.getItem("access");
let password;

if (!access) {
  password = prompt("Введите пароль");
}

if (password === "adminLoh" || access) {
  localStorage.setItem("access", true);
  document.addEventListener("DOMContentLoaded", async () => {
    const firebaseConfig = {
      apiKey: "AIzaSyAue2R_rOU1Up45pZgsSVGXnLzC4Ypj28o",
      authDomain: "praktik-2f40b.firebaseapp.com",
      projectId: "praktik-2f40b",
      storageBucket: "praktik-2f40b.appspot.com",
      messagingSenderId: "168645872906",
      appId: "1:168645872906:web:99ee3dadfc821fa6137ef3",
      measurementId: "G-838H8QQCMH",
    };

    const app = firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const db = firebase.firestore();
    let originGuests = {};

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
        await db
          .collection("room")
          .doc("wRpDZ8eao8Cz1zaMuRK4")
          .update({ occupied });
      },
      getTime: async () => {
        let time = "";
        const room = await db.collection("room").get();
        room.forEach((doc) => {
          time = doc.data().time;
        });
        return time;
      },
      isYouHost: async function () {
        const currentGuest = await this.getCurrentGuest();
        return currentGuest.isHost;
      },
      setTime: async (time = "") => {
        await db
          .collection("room")
          .doc("wRpDZ8eao8Cz1zaMuRK4")
          .update({ time });
      },
      exit: async function () {
        const localUserId = this.getLocalUserId();
        await this.removeUser(localUserId);
      },
      join: async function () {
        const guests = await Room.getGuests();
        const localUserId = this.getLocalUserId();
        const userId = guests[localUserId];

        if (!userId) {
          await this.addUser();
        }
      },
      getCurrentGuest: async function () {
        const localUserId = this.getLocalUserId();
        const guests = await Room.getGuests();
        return guests[localUserId];
      },
      addUser: async function () {
        const guests = await Room.getGuests();
        const userData = await fetch("https://api.db-ip.com/v2/free/self");
        const { ipAddress } = await userData.json();
        const userId = this.setLocalUserId(ipAddress);

        guests[userId] = {
          isHost: false,
          date: new Date(),
          device: navigator.userAgent,
        };

        await db
          .collection("room")
          .doc("wRpDZ8eao8Cz1zaMuRK4")
          .update({ guests });
      },
      removeUser: async function (userId) {
        if (userId) {
          const guests = await Room.getGuests();
          delete guests[userId];
          await db
            .collection("room")
            .doc("wRpDZ8eao8Cz1zaMuRK4")
            .update({ guests });
        } else {
          const guests = await Room.getGuests();
          delete guests[id];
          await db
            .collection("room")
            .doc("wRpDZ8eao8Cz1zaMuRK4")
            .update({ guests });
        }
      },
      toggleHost: async function (userId) {
        const guests = await Room.getGuests();
        if (guests[userId]) {
          guests[userId].isHost = !guests[userId].isHost;
          await db
            .collection("room")
            .doc("wRpDZ8eao8Cz1zaMuRK4")
            .update({ guests });
        } else {
          console.error("user not found");
        }
      },
      getLocalUserId: function () {
        return localStorage.getItem("id");
      },
      setLocalUserId: function (ipAddress) {
        const id = btoa(ipAddress + "cHJha3Rpaw==");
        localStorage.setItem("id", id);
        return id;
      },
      getGuests: async () => {
        let guests = 0;
        const room = await db.collection("room").get();
        room.forEach((doc) => {
          guests = doc.data().guests;
        });
        return guests;
      },
      listener: async (callback = () => {}) => {
        const room = await db.collection("room");
        room.onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            callback(doc.data());
          });
        });
      },
    };
    window.room = Room;

    window.deleteDevice = (id) => {
      Room.removeUser(id);
    };

    window.setHost = (id) => {
      Room.toggleHost(id);
    };

    const updateDevices = async () => {
      const devices = await Room.getGuests();
      const deviceIds = Object.keys(devices);
      const deviceContent = Object.values(devices);
      const container = document.querySelector("#container");
      originGuests = deviceContent;

      const title = `<tr>
                <th>ID</th>
                <th>Хост</th>
                <th>Действие</th>
            </tr>`;

      container.innerHTML =
        title +
        deviceContent.map((device, index) => {
          return `<tr>
      <td>${JSON.stringify(device.device).slice(0, 20)}</td>
      <td>Хост: ${device.isHost ? "Да" : "Нет"}</td>
      <td>
        <div style="display: flex; justify-content: wrap">
            <div class="button7 red" onClick="deleteDevice('${
              deviceIds[index]
            }')">Удалить</div>
            <div class="button7 ${
              device.isHost ? "red" : ""
            }" onClick="setHost('${deviceIds[index]}')">${
            device.isHost ? "Сделать пользователем" : "Сделать хостом"
          }</div>
        </div>
      </td>
      </tr>
      `;
        });
    };

    Room.listener((data) => {
      const serverGuests = Object.values(data.guests);
      if (!_.isEqual(serverGuests, originGuests)) {
        updateDevices();
      }
    });
  });
}
