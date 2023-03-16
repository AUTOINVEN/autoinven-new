module.exports = (db,session) => {
  const express = require('express');
  const router = express.Router();
  const qs = require('querystring');
  const fetch = require("node-fetch");

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getEncryptedPasswordInfo = require('../signup/function/getEncryptedPasswordInfo');


  //카카오
  router.get(
    '/',
    doAsync(async (req, res) => {
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile_nickname,account_email`;
      res.redirect(kakaoAuthURL);
    })
  );

  const kakao = {
    clientID: '09d6906c044decaac37d6caeb38b1892',
    clientSecret: 'OeaFnLBgU8OLXCtrX3pid1gPZT1Rnlp1',
    //redirectUri: 'http://localhost:5000/api/auth/kakao/callback'
    redirectUri: 'http://autoinven.com/api/auth/kakao/callback'
  }

  //카카오 콜백
  router.get(
    '/callback',
    doAsync(async (req, res) => {
      token = await fetch('https://kauth.kakao.com/oauth/token',{//token
        method: 'POST',
        headers:{
            'content-type':'application/x-www-form-urlencoded'
        },
        body:qs.stringify({
            grant_type: 'authorization_code',//특정 스트링
            client_id:kakao.clientID,
            client_secret:kakao.clientSecret,
            redirectUri:kakao.redirectUri,
            code:req.query.code,//결과값을 반환했다. 안됐다.
        })//객체를 string 으로 변환
      }).then((response) => response.json())
      console.log('kakao token : ',token);
      
      let role = 'user';
      let user;//access정보를 가지고 또 요청해야 정보를 가져올 수 있음.
      try{
          
          user = await fetch('https://kapi.kakao.com/v2/user/me',{
              method:'get',
              headers:{
                  Authorization: `Bearer ${token.access_token}`
              }//헤더에 내용을 보고 보내주겠다.
          }).then((response) => response.json())
      }catch(e){
          res.json(e.data);
      }
      console.log(user);
  
      if(user) req.session.kakao = user;
      //req.session = {['kakao'] : user.data};

      let member = await db.User.findOne({
        where: {
          email : user.kakao_account.email,
          is_valid: 1,
        },
      });
      if (!member) {
        try {
          password_info = await getEncryptedPasswordInfo(user.id.toString());
          await db.User.create({
            email : user.kakao_account.email,
            name : user.kakao_account.profile.nickname,
            phone : '',
            salt:'',
            ...password_info,
          });
      
          // 세션에 데이터 저장
          req.session.email = user.kakao_account.email;
          req.session.role = 'user';
          req.session.name = user.kakao_account.profile.nickname;
          req.session.phone = '';
          req.session.save(error => {if(error) console.log(error)})
        } catch (err) {
          throw err;
        }
        role = 'user';
      }else{
        try{
          req.session.email = req.session.kakao.kakao_account.email;
          req.session.role = 'user';
          req.session.name = req.session.kakao.kakao_account.profile.nickname;
          req.session.phone = '';
          req.session.save(error => {if(error) console.log(error)})
        } catch (err) {
          throw err;
        }
      }
      
      //res.send('success');
      res.redirect('/')
    })
  );

  return router;
};
