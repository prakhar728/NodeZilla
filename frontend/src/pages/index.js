import React, { useEffect, useState } from 'react'
import '../style.css';
import Link from 'next/link';

const index = () => {
  const [tvl, settvl] = useState("");
  

  const fetchTVL = () => {
    const options = {method: 'GET'};

    fetch('https://api.eigenexplorer.com/metrics/tvl', options)
    .then(response => response.json())
    .then(response => settvl(response.tvl))
    .catch(err => console.error(err));
  }

  useEffect(() => {
    fetchTVL()
    setInterval(() => {
      fetchTVL()
    }, 4000);
  }, [])
  

  return (
    <React.Fragment>
      <main>
        <header>
          <div className="logo"><img  src={'./Name-n.png'}/></div>
          <ul className="flex gap-8 justify-center items-center px-6">
            <a href="https://www.google.com">Solutions</a>  
            <a href="https://www.google.com">Developers</a>  
            <a href="https://www.google.com">Ecosystem</a>  
            <a href="https://www.google.com">Blogs</a>  
            <a href="https://www.google.com">About</a>  
          </ul>
        </header>
        <section>
          <div className="hero-container">
            <h1>The King of the Node Jungle.</h1>
            <p>Get insights about the AVS nodes, subscribe to their metrics, get their metadata and get notifed about their operations. All in one place!</p>
            <div className="btn-container">
              <button className="btn-primary"><Link href="/app">Go to app</Link></button>
              <button className="btn-secondary"><Link href="http://localhost:8000">Explore API</Link></button>
            </div>
            <div className="label">
              <p>Total Volume</p>
              <h2>${tvl}</h2>
            </div>
          </div>
        </section>
      </main>

      <article className="cards-section">
        <h1>Why NodeZilla?</h1>
        <div className="card-container">
          <div className="card">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#fff" fill="none"><path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h4>Saves Time</h4>
            <p>Fetch historic data with us, stop wrorying about setting up and using a Database. Subscribe to changes</p>
          </div>
          <div className="card">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#fff" fill="none"><path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h4>Easy to understand vizualization</h4>
            <p>We spent time working on the interface so you don't have to spend time understanding the numbers</p>
          </div>
          <div className="card">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#fff" fill="none"><path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h4>Easy Notification</h4>
            <p>Get notified if your favourite node goes down, has a change in it's value or changes their metadat</p>
          </div>
        </div>
      </article>
      
      <article className="features">
        <div className="feature-wrapper">
          <div className="feature-info">
            <h2>1. Real Time Monitoring</h2>
            <p>We update the metrics for <b>active</b> node operators every 30 seconds. In-case of any change you'll be the first one to get updated. You can subscribe and see the changes real time.</p>
          </div>
          <div className="feature-img"><img src={'./Real-time-feature.svg'} /></div>
        </div>

        <div className="feature-wrapper">
          <div className="feature-info">
            <h2>2. Historical Data</h2>
            <p>We've been keeping the metrics up-to date in our database so you don't have to go through the pain of fetching and storing them. Visualized using charts and more!</p>
            {/* <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
            </ul> */}
          </div>
          <div className="feature-img"><img src={'./Historic-feature.svg'} /></div>
        </div>

        <div className="feature-wrapper">
          <div className="feature-info">
            <h2>3. Well Documented API</h2>
            <p>You're a builder? We got you covered. Visit our API, and make your own APP using the data we collected. Ask us for credits we're more than happy to provide!</p>
            
          </div>
          <div className="feature-img"><img src={'./Documented-feature.svg'} /></div>
        </div>
      </article>

      <footer>
        <div className="logo"><img  src={'./Name-n.png'}/></div>
        <ul className="flex gap-8 justify-center items-center px-6">
          <a href="https://www.google.com">Solutions</a>  
          <a href="https://www.google.com">Developers</a>  
          <a href="https://www.google.com">Ecosystem</a>  
          <a href="https://www.google.com">Blogs</a>  
          <a href="https://www.google.com">About</a>  
        </ul>
      </footer>
    </React.Fragment>
  )
}

export default index