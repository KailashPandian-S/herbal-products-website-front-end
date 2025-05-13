
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
  apiKey: "AIzaSyByvs0HM174Ya2rgRaCz7nuVlhfi__EyLs",
  authDomain: "connect-web3.firebaseapp.com",
  projectId: "connect-web3",
  storageBucket: "connect-web3.appspot.com",
  messagingSenderId: "8455618113",
  appId: "1:8455618113:web:8e384c39629f9514b310c0",
  measurementId: "G-5KLBWQ3TR4"
};


const app = initializeApp(projectConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Connect to emulators if a `demo` configuration hasn been pulled from
 * environment.js.
 */
if (app.options.projectId.indexOf('demo-') == 0) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

/**
 * Signs into an `Anonymous` user with which to post restaurants and comments.
 */
const signInWithAnonCredentials = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      'Anonymous@Anonymous.com',
      'AnonymousPassword'
    );
  } catch (userNotCreatedError) {
    await createUserWithEmailAndPassword(
      auth,
      'Anonymous@Anonymous.com',
      'AnonymousPassword'
    );
  }
};

/**
 * Adds a single mock restaurant, and an associated rating, to the Firestore
 * database.
 */
const addFakeRestaurant = async (restaurant) => {
  const restaurantRef = await addDoc(collection(db, 'restaurants'), restaurant);
  addMockRating(restaurantRef.id, restaurant.avgRating);
};

/**
 * A function to generate 20 random `Restaurant` objects. The definiton
 * for a `Restaurant` is given in `../types/restaurant.ts`.
 * @returns A list of 20 mock `Restaurant` objects to send to firestore
 */
const generateMockRestaurants = () => {
  var restaurants = [];

  for (var i = 0; i < 20; i++) {
    var name = getRandomItem(data.words) + ' ' + getRandomItem(data.words);
    var category = getRandomItem(data.categories);
    var city = getRandomItem(data.cities);
    var price = Math.floor(Math.random() * 4) + 1;
    var photoID = Math.floor(Math.random() * 22) + 1;
    // TODO(abradham): Modify to be able to use local emulated storage bucket
    var photo =
      'https://storage.googleapis.com/firestorequickstarts.appspot.com/food_' +
      photoID +
      '.png';
    var numRatings = 0;
    var avgRating = Math.floor(Math.random() * 5) + 1;

    restaurants.push({
      name: name,
      category: category,
      price: price,
      city: city,
      numRatings: numRatings,
      avgRating: avgRating,
      photo: photo,
    });
  }

  return restaurants;
};

/**
 * Adds a list of generated restaurants to Firestore database.
 * @param {Restaurant[]} restaurntsArr
 * @returns {Promise[]} List of promises
 */
const addMockRestaurants = async (restaurntsArr) => {
  let promises = [];
  for (var i = 0; i < restaurntsArr.length; i++) {
    let promise = addFakeRestaurant(restaurntsArr[i]);
    if (!promise) {
      console.debug('Couldn\'t add a restaurant to firestore');
      return Promise.reject();
    } else {
      promises.push(promise);
    }
  }

  await Promise.all(promises);
};

const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 *
 * @param {string} restaurantId: Firebase document id of relevant restaurant object
 * @param {number} avgRating: # of stars given to the restaurant
 */
const addMockRating = async (restaurantId, avgRating) => {
  // Create new `rating` obj
  const newRating = {
    rating: avgRating,
    text: data.ratingsTexts[avgRating],
    userName: 'Anonymous (Bot)',
  };

  // Add new rating to given restaurant's `ratings/` subcollection
  await addDoc(
    collection(db, `restaurants/${restaurantId}/ratings`),
    newRating
  );
};

const main = async () => {
  // Connect to emulators if a `demo` environment is pulled
  if (app.options.projectId.indexOf('demo-') == 0) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  }

  await signInWithAnonCredentials();
  await addMockRestaurants(generateMockRestaurants());
};

main();
