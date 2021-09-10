// shortname: rho

// Rholang code to transfer REVs
// https://github.com/rchain/rchain/blob/3eca061/rholang/examples/vault_demo/3.transfer_funds.rho
export const fn_transfer_funds = (rev_addr_from: string, rev_addr_to: string, amount: number|string) => `
new rl(\`rho:registry:lookup\`), RevVaultCh in {
rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
for (@(_, RevVault) <- RevVaultCh) {
new vaultCh, vaultTo, revVaultkeyCh,
deployerId(\`rho:rchain:deployerId\`),
deployId(\`rho:rchain:deployId\`)
in {
match ("${rev_addr_from}", "${rev_addr_to}", ${amount}) {
(revAddrFrom, revAddrTo, amount) => {
@RevVault!("findOrCreate", revAddrFrom, *vaultCh) |
@RevVault!("findOrCreate", revAddrTo, *vaultTo) |
@RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
for (@vault <- vaultCh; key <- revVaultkeyCh; _ <- vaultTo) {
match vault {
(true, vault) => {
new resultCh in {
@vault!("transfer", revAddrTo, amount, *key, *resultCh) |
for (@result <- resultCh) {
match result {
(true , _  ) => deployId!((true, "Transfer successful (not yet finalized)."))
(false, err) => deployId!((false, err))
}
}
}
}
err => {
deployId!((false, "REV vault cannot be found or created."))
}
}
}
}
}
}
}
}
`;

// Rholang code to check REVs balance
export const fn_check_balance = (rev_addr: string) => `
  new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, balanceCh in {
    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    for (@(_, RevVault) <- RevVaultCh) {
      @RevVault!("findOrCreate", "${rev_addr}", *vaultCh) |
      for (@(true, vault) <- vaultCh) {
        @vault!("balance", *balanceCh) |
        for (@balance <- balanceCh) { return!(balance) }
      }
    }
  }
`;

// Rholang code to bond a validator
export const fn_bond = (amount: number|string) => `
  new retCh, PoSCh, rl(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
    stdout!("About to lookup pos contract...") |

    rl!(\`rho:rchain:pos\`, *PoSCh) |

    for(@(_, PoS) <- PoSCh) {
      stdout!("About to bond...") |

      @PoS!("bond", ${amount}, *retCh) |
      for ( ret <- retCh) {
        stdout!("PoS return!") |
        match *ret {
          {(true, message)} => stdout!(("BOND_SUCCESS", "Successfully bonded!", message))

          {(false, message)} => stdout!(("BOND_ERROR", message))
        }
      }
    }
  }
`;
