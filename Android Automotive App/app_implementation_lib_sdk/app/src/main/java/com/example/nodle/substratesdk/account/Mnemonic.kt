package io.nodle.substratesdk.account

import io.github.novacrypto.bip39.MnemonicGenerator
import io.github.novacrypto.bip39.MnemonicValidator
import io.github.novacrypto.bip39.Validation.InvalidChecksumException
import io.github.novacrypto.bip39.Validation.InvalidWordCountException
import io.github.novacrypto.bip39.Validation.UnexpectedWhiteSpaceException
import io.github.novacrypto.bip39.Validation.WordNotFoundException
import io.github.novacrypto.bip39.Words
import io.github.novacrypto.bip39.wordlists.English

import org.bouncycastle.crypto.digests.SHA512Digest
import org.bouncycastle.crypto.generators.PKCS5S2ParametersGenerator
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
import org.bouncycastle.crypto.params.KeyParameter
import java.security.SecureRandom
import java.util.*

/**
 * @author Lucien Loiseau on 28/05/20.
 */
object Mnemonic {

    fun newTwelveWords(): List<String> {
        /*
        val ret = mutableListOf<String>()
        val entropy = ByteArray(Words.TWELVE.byteLength())
        SecureRandom().nextBytes(entropy)
        MnemonicGenerator(English.INSTANCE)
            .createMnemonic(entropy) {
                    s: CharSequence? -> ret.add(s.toString())
            }
        return ret
        */
        val sb = StringBuilder()
        val entropy = ByteArray(Words.TWELVE.byteLength())
        SecureRandom().nextBytes(entropy)
        MnemonicGenerator(English.INSTANCE)
            .createMnemonic(
                entropy
            ) { s: CharSequence? -> sb.append(s) }
        return sb.split(" ")
    }



}