// Rholang code to transfer REVs
// https://github.com/rchain/rchain/blob/3eca061/rholang/examples/vault_demo/3.transfer_funds.rho
export const fn_transfer_funds = (rev_addr_from: string, rev_addr_to: string, amount: number|string) => `
  new
    rl(\`rho:registry:lookup\`), RevVaultCh,
    stdout(\`rho:io:stdout\`)
  in {

    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |W
    for (@(_, RevVault) <- RevVaultCh) {

      stdout!(("MyRChainWallet.TransferREVs.rho")) |

      match ("${rev_addr_from}", "${rev_addr_to}", ${amount}) {
        (from, to, amount) => {

          new vaultCh, revVaultkeyCh, deployerId(\`rho:rchain:deployerId\`) in {
            @RevVault!("findOrCreate", from, *vaultCh) |
            @RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
            for (@(true, vault) <- vaultCh; key <- revVaultkeyCh) {

              stdout!(("Beginning transfer of ", amount, "REV from", from, "to", to)) |

              new resultCh in {
                @vault!("transfer", to, amount, *key, *resultCh) |
                for (@result <- resultCh) {

                  stdout!(("Finished transfer of ", amount, "REV to", to, "result was:", result))
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
