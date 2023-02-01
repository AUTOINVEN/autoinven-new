module.exports = async (email, password, db, session, client_type) => {
  const getEncryptedPasswordInfo = require('../signup/function/getEncryptedPasswordInfo');

  // 멤버 확인
  let role = 'user';

  let member = await db.User.findOne({
    where: {
      email,
      is_valid: 1,
    },
  });
  if (!member) {
    member = await db.Admin.findByPk(email);

    if (!member) {
      const error = new Error('No Corresponding Member');
      error.statusCode = 401;
      throw error;
    }

    role = 'admin';
  }else{
    role = 'user';
  }

  // 비밀번호 확인
  const { password: encrypted_password } = await getEncryptedPasswordInfo(
    password,
    member.salt
  );
  if (encrypted_password !== member.password) {
    const error = new Error('Password Not Matched');
    error.statusCode = 401;
    throw error;
  }
  console.log('client_type',client_type)
console.log(role)
  // 웹인 경우
  if (client_type === 'web') {
    // 세션에 데이터 저장
    session.email = email;
    session.role = role;
    session.name = member.name;
    session.phone = member.phone;
    session.role = role;
    console.log(session)

    session.save(error => {if(error) console.log(error)})
    return {
      message: 'success',
    };
    
  }
  // 앱인 경우
  else {
    // jwt 반환
    const jwt = require('jsonwebtoken');
    const secret_key = process.env.JWT_SECRET_KEY;

    return {
      token: jwt.sign(
        {
          email,
          role,
          name: member.name,
          phone: member.phone,
        },
        secret_key,
        {
          expiresIn: '1h',
        }
      ),
    };
  }
};
