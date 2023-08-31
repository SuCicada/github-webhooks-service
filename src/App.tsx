import React, {useState} from 'react';
import './App.scss';
import {Link} from 'react-router-dom'
import axios from 'axios';


export const Button: React.FC<{ label: string, url: string }> = ({label, url}) => {
    const [isClick, setIsClick] = useState(false);

    const handleButtonClick = () => {
        setIsClick(true);
        // console.log('isClick', isClick);
        // 模拟 AJAX 请求，延迟 2 秒
        axios.post(url)
            .then(response => {
                let data: { message: string, success: boolean } = response.data
                console.log('res:', data);
                if (data.success) alert('success')
                else alert(data.message)
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error)
            })
            .finally(() => {
                setIsClick(false);
            })
        // setTimeout(function () {
        //     console.log('isClick', isClick);
        // }, 2000);
    };

    return (
        <div className="myButton-container">
            <button
                className={`myButton ${isClick ? 'isClick' : 'noClick'}`}
                disabled={isClick}
                onClick={handleButtonClick}>
              <span className="button-content">
                  {label}
                  <span className="loader"></span>
              </span>
            </button>
        </div>
    );
};

export const UpdateRepoInfoButton = () => <Button label="Update RepoInfo"
                                                  url={getServerUrl("/updateNotionRepoInfo")}/>

function App() {

    return (
        // <BrowserRouter>
        // <Route path="/" exact component={Home} />
        // <Route path="/update" Component={UpdateButton}/>
        // </BrowserRouter>
        <div className="App">
            <h1>路由练习</h1>
            <nav>
                <Link className='link' to='/updateNotionRepoInfo'> Tab1</Link>
                {/*<Link className = 'link' to='/Tab2'> Tab2 </Link> ///覆盖：渲染tab2组件*/}
            </nav>
        </div>
    );
}

export default App;

function getServerUrl(api: string) {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    const searchParams = new URLSearchParams(window.location.search);
    const serverPassword = searchParams.get('p')
    const parsedURL = new URL(SERVER_URL)
    parsedURL.searchParams.set('p', serverPassword);
    parsedURL.pathname = api

    let url = parsedURL.toString()
    console.log('server url', url)
    return url
}

function joinUrl(base: string, ...parts: string[]): string {
    const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const trimmedParts = parts.map(part => (part.startsWith('/') ? part.slice(1) : part));
    return `${trimmedBase}/${trimmedParts.join('/')}`;
}
