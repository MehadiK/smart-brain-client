import React, { Component } from 'react';
//import Clari fai from 'clarifai';
import './App.css';
import Navigation from './Componenets/Navigation/Navigation';
import Logo from './Componenets/Logo/Logo';
import ImageLinkForm from './Componenets/ImageLinkForm/ImageLinkForm';
import Rank from './Componenets/Rank/Rank';
import ParticlesBg from 'particles-bg';
import FaceRecognition from './Componenets/FaceRecognition/FaceRecognition';
import SignIn from './Componenets/SignIn/SignIn';
import Register from './Componenets/Register/Register';



const returnClarifaiRequestOptions = (imageUrl) => {
  const PAT = 'c1d3ee5cb1ba45db96db0daac7864ad0';
  const USER_ID = 'mehadi_khan';
  const APP_ID = 'Smart-Brain';
  //const MODEL_ID = 'face-detection';
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID,
    },
    "inputs": [
      {
        "data": {
          "image": {
            "url": IMAGE_URL
          }
        }
      }
    ]
  });

  const requestOptions = {
    //mode: 'no-cors',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  return requestOptions;

};

// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
// this will default to the latest version_id



const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  };

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  };


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch("https://api.clarifai.com/v2/models/" + "face-detection" + "/versions/" + "6dc7e46bc9124c5c8824be4822abe105" + "/outputs", returnClarifaiRequestOptions(this.state.input))
      .then(response => response.json())
      .then(result => {
        if (result) {
          fetch('https://stark-beyond-44135-48f2a61d509c.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(result))
      })
      .catch(error => console.log('error', error))
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route })
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg className='particles' color='#ffffff' type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home'
          ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (
            route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />

          )
        }
      </div>
    );
  }
}



export default App;
