module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');

  //카카오
  router.get(
    '/',
    doAsync(async (req, res) => {
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
      res.redirect(kakaoAuthURL);
    })
  );

  const kakao = {
    clientID: 'a78cff9fe4bee234ad577510e6a95d1d',
    clientSecret: '클라이언트 SECRET키',
    redirectUri: 'http://localhost:5000/api/auth/kakao/callback'
  }

  //카카오 콜백
  router.post(
    '/callback',
    doAsync(async (req, res) => {
      try{//access토큰을 받기 위한 코드
        token = await axios({//token
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({
                grant_type: 'authorization_code',//특정 스트링
                client_id:kakao.clientID,
                //client_secret:kakao.clientSecret,
                redirectUri:kakao.redirectUri,
                code:req.query.code,//결과값을 반환했다. 안됐다.
            })//객체를 string 으로 변환
        })
      }catch(err){
          res.json(err.data);
      }
      //access토큰을 받아서 사용자 정보를 알기 위해 쓰는 코드
          let user;
          try{
              console.log(token);//access정보를 가지고 또 요청해야 정보를 가져올 수 있음.
              user = await axios({
                  method:'get',
                  url:'https://kapi.kakao.com/v2/user/me',
                  headers:{
                      Authorization: `Bearer ${token.data.access_token}`
                  }//헤더에 내용을 보고 보내주겠다.
              })
          }catch(e){
              res.json(e.data);
          }
          console.log(user);
      
          req.session.kakao = user.data;
          //req.session = {['kakao'] : user.data};
          
          res.send('success');
    })
  );

  return router;
};
