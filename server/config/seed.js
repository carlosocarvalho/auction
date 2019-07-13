/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Page = require('../api/page/page.model');
var Mail = require('../api/mail/mail.model');
var News = require('../api/news/news.model');


User.find({ email: 'admin@admin.com' }, function (err, resp) {

  console.log("erro = ", err);
  console.log("rep = ", resp);

  if (resp.length == 0) {

    User.create({
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      login: 'admin',
      email: 'admin@admin.com',
      password: 'admin'
    }, function () {
      console.log('finished populating users');
    }
    );

  }

});



Page.find({ codigo: 1 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 1,
      name: 'Leilões',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 2 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 2,
      name: 'Lotes',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 3 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 3,
      name: 'Taxas Administrativas',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 4 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 4,
      name: 'Leilões',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 5 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 5,
      name: 'Boletos',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 6 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 6,
      name: 'Banners',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 7 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 7,
      name: 'Imprensa',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 8 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 8,
      name: 'Usuarios',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 9 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 9,
      name: 'Comitentes',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 10 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 10,
      name: 'Categorias',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Page.find({ codigo: 11 }, function (err, resp) {
  if (resp.length == 0) {
    Page.create({
      codigo: 11,
      name: 'Grupos',
      info: '',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});


Mail.find({ name: 'novo_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 1,
      name: 'novo_usuario',
      html: '<p>Amigo cliente, seu cadastro foi realizado com sucesso! Atenção , memorize e salve seu Login e senha cadastrados no nosso sistema. Só assim você poderá participar das nossas ofertas no portal LEILOAR.NET </p><p>Prezado(a) [USER],</p><p>Para ativar seu cadastro pedimos que clique em <a href="[LINK_ATIVATION]">Ativar cadastro</a> </p><p>Certifique-se de que a leiloar.net faz parte de sua listade sites confiáveis. Atenção, sugerimos que verifique com frequência sua caixa de entrada para certificar-se que está recebendo nossos e-mails normalmente. Verifique também os bloqueios antispam, lixo eletrônico e capacidade de armazenamento de sua conta de e-mail, para que nossa comunicação seja rápida, clara e segura. Informamos que nossa comunicação com você será preferencialmente por e-mail. Caso deseje entrar em contato conosco, entre em nosso site no ?Fale Conosco? e escolha a opção que melhor lhe atender. Fique atento a qualquer informação divergente em seu cadastro e entre em contato conosco caso haja qualquer dúvida. O andamento dos nossos leilões poderá ser acompanhado através do nosso site e você também encontrará detalhes em sua conta, que é acessada através de seu login e senha. Seja bem-vindo e ótimos negócios!</p><p>Atenciosamente, Leiloar.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'novo_usuario_admin' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 2,
      name: 'novo_usuario_admin',
      from: 'leiloar@leiloar.net',
      subject: 'Cadastro - Leiloar Leilões Online',
      html: '<p>Amigo cliente, seu cadastro foi realizado com sucesso! Atenção , memorize e salve seu Login e senha cadastrados no nosso sistema. Só assim você poderá participar das nossas ofertas no portal LEILOAR.NET </p><p>Prezado(a) [USER],</p><p>Para ativar seu cadastro pedimos que clique em <a href="[LINK_ATIVATION]">Ativar cadastro</a> e informe a seguinte senha temporária: [TEMP_PASSWORD] </p><p>Certifique-se de que a leiloar.net faz parte de sua lista de sites confiáveis. Atenção, sugerimos que verifique com frequência sua caixa de entrada para certificar-se que está recebendo nossos e-mails normalmente. Verifique também os bloqueios antispam, lixo eletrônico e capacidade de armazenamento de sua conta de e-mail, para que nossa comunicação seja rápida, clara e segura. Informamos que nossa comunicação com você será preferencialmente por e-mail. Caso deseje entrar em contato conosco, entre em nosso site no ?Fale Conosco? e escolha a opção que melhor lhe atender. Fique atento a qualquer informação divergente em seu cadastro e entre em contato conosco caso haja qualquer dúvida. O andamento dos nossos leilões poderá ser acompanhado através do nosso site e você também encontrará detalhes em sua conta, que é acessada através de seu login e senha. Seja bem-vindo e ótimos negócios!</p><p>Atenciosamente, Leiloar.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_vencedor_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 3,
      name: 'lote_vencedor_usuario',
      subject: 'LEILOAR - PARABÉNS',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado(a) [USER], Parabéns!</p><p>Seu lance de [LANCE] foi o vencedor no lote de número:[N_LOTE] do leilão:[N_LEILAO]</a> </p><p>Entraremos em contato.</p><p>Atenciosamente, Leiloar.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});


Mail.find({ name: 'fale_conosco' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 4,
      name: 'fale_conosco',
      subject: 'LEILOAR - Fale Conosco',
      from: 'leiloar@leiloar.net',
      html: '<p>Este e-mail foi recebido do site da LEILOAR.NET.</p><p>Nome: [CONTACT_NAME]<br>E-mail: [CONTACT_EMAIL]<br>Assunto: [CONTACT_SUBJECT]<br>Telefone: [CONTACT_PHONE]</p><p>Mensagem:</p><p>[CONTACT_MESSAGE]</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'reset_senha' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 5,
      name: 'reset_senha',
      subject: 'LEILOAR - Sua senha de acesso foi reiniciada.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua senha de acesso ao LEILOAR foi reiniciada.</p><p>Para seu próximo acesso, informe a seguinte senha: </p><h3>[USER_PASSWORD]</h3>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_vendadireta_vencedor_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 6,
      name: 'lote_vendadireta_vencedor_usuario',
      subject: 'LEILOAR - Parabéns.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua proposta de [PROPOSTA] ao lote [LOTE] da Venda [VENDA] foi aceita.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_proposta_enviada_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 7,
      name: 'lote_proposta_enviada_usuario',
      subject: 'LEILOAR - PROPOSTA ENVIADA.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua proposta de [PROPOSTA] ao lote [LOTE] do Leilão [LEILAO] foi enviada com sucesso.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_proposta_enviada_admin' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 8,
      name: 'lote_proposta_enviada_admin',
      subject: 'LEILOAR - PROPOSTA RECEBIDA.',
      from: 'leiloar@leiloar.net',
      to: 'leiloar@leiloar.net',
      html: '<p>Prezado ADMINISTRADOR,</p><p>Você está recebendo essa mensagem porque uma proposta de [PROPOSTA] do usuário [USER] ao lote [LOTE] do Leilão [LEILAO] foi recebida.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_leilao_vencedor_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 9,
      name: 'lote_leilao_vencedor_usuario',
      subject: 'LEILOAR - Parabéns.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua proposta de [PROPOSTA] ao lote [LOTE] do [LEILAO] foi aceita.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'lote_leilao_recusada_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 10,
      name: 'lote_leilao_recusada_usuario',
      subject: 'LEILOAR - INFORMA.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua proposta de [PROPOSTA] ao lote [LOTE] do [LEILAO] foi recusada.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'usuario_email_meusDados' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
        codigo: 11,
        name: 'usuario_email_meusDados',
        subject:'LEILOAR - Alteração de email',
        from:'leiloar@leiloar.net',
        html: '<p>Prezado(a) [USER],</p> <p>Seu email anterior [LASTEMAIL] foi alterado com sucesso</p> <p>Acesse o link para efetuar a autenticação. <a href="[LINK_ATIVATION]">Ativação</a></p><p>Atenciosamente, Leiloar.</p>',
      }, function() {
        console.log('finished populating pages');
      }
    );
  }
});


Mail.find({ name: 'usuario_email_meusDadosBackup' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
        codigo: 12,
        name: 'usuario_email_meusDadosBackup',
        subject:'LEILOAR - Alteração de email',
        from:'leiloar@leiloar.net',
        html: '<p>Prezado(a) [USER],</p> <p>Seu email [LASTEMAIL] foi o alterado para [USEREMAIL] </p> </p><p>Atenciosamente, Leiloar.</p>',
      }, function() {
        console.log('finished populating pages');
      }
      
    );
  }
});

News.find({ name: 'CLIENTES PELO SITE' }, function (err, resp) {
  User.find({ active: true, deleted: false }, { _id: 0, email: 1 }, function (err, data) {
    //console.log(data);
    if (resp.length == 0) {
      News.create({
          name: 'CLIENTES PELO SITE',
          emails:data,
          editable:false,
        }, function() {
          console.log('finished populating news');
        }
      );
    }else {
      News.update({cod:1},{$set:{emails:data}});
    }
  })

});


News.find({ name: 'NEWSLETTER DO SITE' }, function (err, resp) {
 
    //console.log(data);
    if (resp.length == 0) {
      News.create({
          name: 'NEWSLETTER DO SITE',
          emails:[],
          editable:false,
        }, function() {
          console.log('finished populating news');
        }
      );
    }


});

Mail.find({ name: 'lote_venda_recusada_usuario' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 11,
      name: 'lote_venda_recusada_usuario',
      subject: 'LEILOAR - INFORMA.',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado [USER],</p><p>Você está recebendo essa mensagem porque sua proposta de [PROPOSTA] ao lote [LOTE] do [VENDA] foi recusada.</p>',
    }, function () {
      console.log('finished populating pages');
    }
    );
  }
});

Mail.find({ name: 'usuario_esqueceu_senha' }, function (err, resp) {
  if (resp.length == 0) {
    Mail.create({
      codigo: 13,
      name: 'usuario_esqueceu_senha',
      subject: 'LEILOAR - Recuperação de senha',
      from: 'leiloar@leiloar.net',
      html: '<p>Prezado(a) [USER],</p> <p>Seu token para alteração de senha é [TOKEN] </p> </p><p>Atenciosamente, Leiloar.</p>',
    }, function () {
      console.log('finished populating pages');
    }

    );
  }
});