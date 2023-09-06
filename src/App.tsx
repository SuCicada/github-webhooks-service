import React, {useState} from 'react';
import './App.scss';
import {Link} from 'react-router-dom'
import axios from 'axios';


export const Button: React.FC<{ label: string, url: string }> = ({label, url}) => {
    const [isClick, setIsClick] = useState(false);
    const [buttonText, setButtonText] = useState(label);
    const [extClass, setExtClass] = useState('');
    const alert = (success: boolean, msg: string) => {
        let oldText = buttonText;
        if (success) {
            setExtClass('success');
        } else {
            setExtClass('failed');
        }
        setButtonText(msg);

        setTimeout(() => {
            setExtClass('');
            setButtonText(oldText);
        }, 1000);
        console.log('msg', msg)
    }
    const handleButtonClick = () => {
        setIsClick(true);
        // console.log('isClick', isClick);
        // 模拟 AJAX 请求，延迟 2 秒
        console.log('axios:', url);
        axios.post(url)
            .then(response => {
                let data: { message: string, success: boolean } = response.data
                console.log('res:', data);
                if (data.success) alert(true, 'success')
                else alert(false, data.message)
            })
            .catch(error => {
                console.error('Error:', error);
                alert(false, error.message)
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
                className={`myButton ${isClick ? 'isClick' : 'noClick'} ${extClass}`}
                disabled={isClick}
                onClick={handleButtonClick}>
              <span className="button-content">
                  <span className="button-text">{buttonText}</span>
                  <span className="loader"></span>
              </span>
            </button>
        </div>
    );
};

export const UpdateRepoInfoButton: React.FC = () => <Button label="Pull RepoInfo"
                                                            url={getServerUrl("/updateNotionRepoInfo")}/>
export const UpdateGithubWebhooksButton: React.FC = () => <Button label="Push GitHubInfo"
                                                                   url={getServerUrl("/updateGithubWebhooks")}/>
export const UpdateHooksSelectButton: React.FC = () => <Button label="Sync HooksSelect"
                                                               url={getServerUrl("/updateHooksSelect")}/>

export const TestButton: React.FC = () => <Button label="Test"
                                                  url={getServerUrl("/test")}/>

function App() {

    return (
        // <BrowserRouter>
        // <Route path="/" exact component={Home} />
        // <Route path="/update" Component={UpdateButton}/>
        // </BrowserRouter>
        <div className="App">
            {/*<h1>路由练习</h1>*/}
            <nav>
                <Link className='link' to='/updateNotionRepoInfo'> updateNotionRepoInfo</Link><br/>
                <Link className='link' to='/updateGithubWebhooks'> updateGithubWebhooks</Link><br/>
                <Link className='link' to='/updateHooksSelect'> updateHooksSelect</Link><br/>
                <Link className='link' to='/test'> test </Link>
            </nav>

            {/*<UpdateRepoInfoButton/>*/}
            {/*<TestButton/>*/}
        </div>
    );
}

export default App;

function getServerUrl(api: string) {
    let SERVER_URL = process.env.REACT_APP_SERVER_URL;
    console.log('SERVER_URL', SERVER_URL)
    const searchParams = new URLSearchParams(window.location.search);
    const serverPassword = searchParams.get('p')
    if (SERVER_URL.startsWith('/')) {
        SERVER_URL = window.location.origin + SERVER_URL
    }
    const parsedURL = new URL(SERVER_URL)
    parsedURL.searchParams.set('p', serverPassword);
    console.log('parsedURL.pathname', parsedURL.pathname)
    parsedURL.pathname = joinUrl(parsedURL.pathname, api)

    let url = parsedURL.toString()
    console.log('server url', url)
    return url
}

function joinUrl(base: string, ...parts: string[]): string {
    const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const trimmedParts = parts.map(part => (part.startsWith('/') ? part.slice(1) : part));
    return `${trimmedBase}/${trimmedParts.join('/')}`;
}
